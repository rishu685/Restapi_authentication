const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, category, dueDate, assignedTo, tags } = req.body;

  // If no assignedTo is provided, assign to current user
  const taskData = {
    title,
    description,
    status,
    priority,
    category,
    dueDate,
    assignedTo: assignedTo || req.user._id,
    createdBy: req.user._id,
    tags
  };

  // Only admin can assign tasks to other users
  if (assignedTo && !req.user._id.equals(assignedTo) && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can assign tasks to other users'
    });
  }

  const task = await Task.create(taskData);
  await task.populate('assignedTo', 'username email profile');
  await task.populate('createdBy', 'username email profile');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter based on user role
  let filter = {};

  // Non-admin users can only see their own tasks
  if (req.user.role !== 'admin') {
    filter = {
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ]
    };
  }

  // Apply query filters
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  if (req.query.createdBy) filter.createdBy = req.query.createdBy;
  if (req.query.isArchived !== undefined) filter.isArchived = req.query.isArchived === 'true';

  // Date filters
  if (req.query.dueDate) {
    if (req.query.dueDate === 'overdue') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $nin: ['completed', 'cancelled'] };
    } else if (req.query.dueDate === 'today') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.dueDate = { $gte: today, $lt: tomorrow };
    }
  }

  // Search functionality
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { category: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Sorting
  let sortBy = { createdAt: -1 };
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sortBy = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'username email profile')
    .populate('createdBy', 'username email profile')
    .populate('comments.author', 'username profile')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: {
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    }
  });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'username email profile')
    .populate('createdBy', 'username email profile')
    .populate('comments.author', 'username profile');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user can access this task
  if (req.user.role !== 'admin' && 
      !task.assignedTo._id.equals(req.user._id) && 
      !task.createdBy._id.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: { task }
  });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user can modify this task
  if (!task.canModify(req.user._id, req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify tasks you created or are assigned to'
    });
  }

  // Prevent non-admin users from changing assignedTo
  if (req.body.assignedTo && req.user.role !== 'admin' && !task.assignedTo.equals(req.body.assignedTo)) {
    return res.status(403).json({
      success: false,
      message: 'Only admins can reassign tasks'
    });
  }

  // Update task
  const allowedUpdates = [
    'title', 'description', 'status', 'priority', 
    'category', 'dueDate', 'tags', 'isArchived'
  ];

  if (req.user.role === 'admin') {
    allowedUpdates.push('assignedTo');
  }

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  task = await Task.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  await task.populate('assignedTo', 'username email profile');
  await task.populate('createdBy', 'username email profile');
  await task.populate('comments.author', 'username profile');

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task }
  });
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user can delete this task
  if (!task.canModify(req.user._id, req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete tasks you created or are assigned to'
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

// @desc    Add comment to task
// @route   POST /api/v1/tasks/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user can access this task
  if (req.user.role !== 'admin' && 
      !task.assignedTo.equals(req.user._id) && 
      !task.createdBy.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await task.addComment(content, req.user._id);
  await task.populate('comments.author', 'username profile');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: { 
      comment: task.comments[task.comments.length - 1]
    }
  });
});

// @desc    Get task statistics
// @route   GET /api/v1/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Non-admin users can only see their own stats
  if (req.user.role !== 'admin') {
    matchQuery = {
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ]
    };
  }

  const stats = await Task.aggregate([
    { $match: { ...matchQuery, isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityStats = await Task.aggregate([
    { $match: { ...matchQuery, isArchived: false } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  const overdueTasks = await Task.countDocuments({
    ...matchQuery,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false
  });

  const completedThisMonth = await Task.countDocuments({
    ...matchQuery,
    status: 'completed',
    completedAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    }
  });

  res.status(200).json({
    success: true,
    message: 'Task statistics retrieved successfully',
    data: {
      statusStats: stats,
      priorityStats,
      overdueTasks,
      completedThisMonth
    }
  });
});

// @desc    Get my tasks
// @route   GET /api/v1/tasks/my-tasks
// @access  Private
const getMyTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    assignedTo: req.user._id,
    isArchived: false
  };

  // Apply filters
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'username email profile')
    .populate('createdBy', 'username email profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Your tasks retrieved successfully',
    data: {
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    }
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskStats,
  getMyTasks
};