const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    return res.status(400).json({
      success: false,
      message: `User with this ${field} already exists`
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    profile: {
      firstName,
      lastName
    }
  });

  // Generate token
  const token = generateToken({
    id: user._id,
    username: user.username,
    role: user.role
  });

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toAuthJSON(),
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by credentials
    const user = await User.findByCredentials(email, password);

    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toAuthJSON(),
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: user.toAuthJSON()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['username', 'email', 'profile.firstName', 'profile.lastName', 'profile.avatar'];
  const updates = {};

  // Filter allowed updates
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      if (key.startsWith('profile.')) {
        const profileKey = key.split('.')[1];
        if (!updates.profile) updates.profile = {};
        updates.profile[profileKey] = req.body[key];
      } else {
        updates[key] = req.body[key];
      }
    }
  });

  // Check if username or email already exists (if being updated)
  if (updates.username || updates.email) {
    const query = {
      _id: { $ne: req.user._id }
    };

    if (updates.username) query.username = updates.username;
    if (updates.email) query.email = updates.email;

    const existingUser = await User.findOne({
      $or: [
        updates.username ? { username: updates.username } : null,
        updates.email ? { email: updates.email } : null
      ].filter(Boolean)
    });

    if (existingUser) {
      const field = existingUser.username === updates.username ? 'username' : 'email';
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toAuthJSON()
    }
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a JWT-based system, logout is mainly handled client-side
  // Here we could implement token blacklisting if needed
  
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Get all users (admin only)
// @route   GET /api/v1/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const users = await User.find(filter)
    .select('-__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: users.map(user => user.toAuthJSON()),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    }
  });
});

// @desc    Update user role (admin only)
// @route   PUT /api/v1/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: user.toAuthJSON()
    }
  });
});

// @desc    Deactivate user (admin only)
// @route   PUT /api/v1/auth/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    data: {
      user: user.toAuthJSON()
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getUsers,
  updateUserRole,
  deactivateUser
};