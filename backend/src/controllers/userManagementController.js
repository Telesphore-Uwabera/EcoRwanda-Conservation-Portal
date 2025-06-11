const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'administrator' } }).select('-password'); // Exclude administrators from this list for simplicity in general management
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  const validRoles = ['volunteer', 'researcher', 'ranger', 'administrator'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing the role of the primary administrator or self-demotion
    if (user.role === 'administrator' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Cannot change the role of another administrator' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the primary administrator account (if applicable)
    if (user.role === 'administrator') {
      return res.status(403).json({ message: 'Cannot delete an administrator account' });
    }

    await user.deleteOne(); // Use deleteOne() for Mongoose 5.x/6.x or remove() for older

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new user by admin
// @route   POST /api/users/register
// @access  Private/Admin
exports.registerUserByAdmin = async (req, res) => {
  const { firstName, lastName, email, password, role, location, organization } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const validRoles = ['volunteer', 'researcher', 'ranger', 'administrator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password, // Password will be hashed by pre-save hook in User model
      role,
      location,
      organization,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error registering user by admin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 