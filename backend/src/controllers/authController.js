const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto'); // Import crypto module
const sendEmail = require('../utils/sendEmail'); // Import the sendEmail utility
const { logActivity } = require('../utils/activityLogger');
// You might need a nodemailer transporter setup here or in a separate utility
// const sendEmail = require('../utils/sendEmail'); // Assuming a utility to send emails

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Password strength validation
    const strongPassword =
      typeof password === 'string' &&
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
    if (!strongPassword) {
      return res.status(400).json({ message: 'Password is not strong enough' });
    }

    // Prevent ranger registration through public endpoint
    if (role === 'ranger') {
      return res.status(403).json({ message: 'Ranger registration is not allowed through this endpoint. Please contact an administrator.' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'volunteer'
    });

    await user.save();

    // Log the activity
    await logActivity(`New user '${user.firstName} ${user.lastName}' registered as a ${user.role}.`, user._id, `/admin/user-management/view/${user._id}`);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User found with role:', user.role);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('Password verified for user:', email);

    // Check if user is verified
    if (!user.verified && user.role !== 'administrator') {
      return res.status(403).json({ 
        message: 'Your account has not been verified yet. Please wait for an administrator to approve your registration.',
        errorCode: 'ACCOUNT_NOT_VERIFIED' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role, verified: user.verified },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      verified: user.verified,
      location: user.location,
      organization: user.organization
    };

    console.log('Login successful for user:', email, 'with role:', user.role);
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security, always return a generic success message even if user not found
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and save it to the user document
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // Construct the reset URL using an environment variable for flexibility
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    // Send the email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
    });

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // Hash the incoming token to compare with the one stored in the database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Check if the new password is the same as the current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as your current password.' });
    }

    // Set new password
    user.password = newPassword; // Mongoose pre-save hook will hash this
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 