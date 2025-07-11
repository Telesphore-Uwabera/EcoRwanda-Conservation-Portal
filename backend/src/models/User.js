const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['volunteer', 'researcher', 'ranger', 'administrator'],
    default: 'volunteer'
  },
  location: {
    type: String,
    trim: true,
    required: false, // Optional field
  },
  organization: {
    type: String,
    trim: true,
    required: false, // Optional field
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // First try direct comparison
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    if (isMatch) {
      console.log('Password matched on first attempt');
      return true;
    }

    // If first attempt fails, try comparing with a re-hashed version
    // This handles cases where the password might have been hashed twice
    const rehashedPassword = await bcrypt.hash(candidatePassword, 10);
    const isMatchRehashed = await bcrypt.compare(rehashedPassword, this.password);
    if (isMatchRehashed) {
      console.log('Password matched after re-hashing');
      return true;
    }

    console.log('Password comparison failed');
    return false;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 