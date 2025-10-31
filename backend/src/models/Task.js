const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Task title cannot be empty'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: 'Status must be one of: pending, in-progress, completed, cancelled'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be one of: low, medium, high, urgent'
    },
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Allow null/undefined, but if provided, must be in the future
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to a user']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have a creator']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task duration (if completed)
taskSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return Math.ceil((this.completedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.dueDate && this.status !== 'completed' && this.status !== 'cancelled') {
    return new Date() > this.dueDate;
  }
  return false;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (this.dueDate && this.status !== 'completed' && this.status !== 'cancelled') {
    const diffTime = this.dueDate - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Indexes for better performance
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ isArchived: 1 });

// Compound indexes
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ status: 1, priority: 1 });

// Pre-save middleware to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Pre-save middleware to validate due date
taskSchema.pre('save', function(next) {
  if (this.dueDate && this.dueDate <= new Date()) {
    next(new Error('Due date must be in the future'));
  }
  next();
});

// Static method to get tasks by user with filters
taskSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { assignedTo: userId, isArchived: false };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.dueDate) {
    if (filters.dueDate === 'overdue') {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['completed', 'cancelled'] };
    } else if (filters.dueDate === 'today') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.dueDate = { $gte: today, $lt: tomorrow };
    }
  }
  
  return this.find(query)
    .populate('assignedTo', 'username email profile')
    .populate('createdBy', 'username email profile')
    .populate('comments.author', 'username profile')
    .sort({ createdAt: -1 });
};

// Static method to get task statistics
taskSchema.statics.getStatsByUser = function(userId) {
  return this.aggregate([
    {
      $match: { assignedTo: mongoose.Types.ObjectId(userId), isArchived: false }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to add comment
taskSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId
  });
  return this.save();
};

// Instance method to check if user can modify task
taskSchema.methods.canModify = function(userId, userRole) {
  // Admin can modify any task
  if (userRole === 'admin') return true;
  
  // Creator and assignee can modify
  return this.createdBy.equals(userId) || this.assignedTo.equals(userId);
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;