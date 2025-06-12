const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); // Import the sendEmail utility

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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password

    if (!user) {
      console.log(`User with ID ${req.params.id} not found.`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User data fetched for ID ${req.params.id}:`, user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
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

// @desc    Toggle user verification status
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
exports.toggleUserVerification = async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body; // Expecting the new verified status from frontend

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent un-verification if the user is already verified
    if (user.verified === true && verified === false) {
      return res.status(400).json({ message: 'Verified accounts cannot be unverified through this action.' });
    }

    // Update the verified status
    user.verified = verified;
    await user.save();
    console.log(`User ${user.email} verification status updated to ${user.verified} and saved to DB.`);

    // Send email notification
    const subject = user.verified ? 'Account Verified!' : 'Account Unverified';
    const message = user.verified
      ? `Dear ${user.firstName},\n\nYour EcoRwanda Conservation Portal account has been successfully verified. You now have full access to all features.\n\nThank you for your dedication!\nEcoRwanda Conservation Portal Team.`
      : `Dear ${user.firstName},\n\nYour EcoRwanda Conservation Portal account verification status has been changed to unverified. Please contact an administrator for more details if this was unexpected.\n\nEcoRwanda Conservation Portal Team.`;

    await sendEmail({
      email: user.email,
      subject: subject,
      message: message,
    });

    res.status(200).json({ message: 'User verification status updated successfully', user: { _id: user._id, verified: user.verified } });
  } catch (error) {
    console.error('Error toggling user verification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 