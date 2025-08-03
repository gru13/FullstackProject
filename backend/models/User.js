const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'faculty'],
    required: true
  },
  password: {
    type: String,
    required: true
  },
  appPassword: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  }
}, { timestamps: true });

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

// Hash appPassword before saving

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare appPassword
userSchema.methods.compareAppPassword = async function(candidateAppPassword) {
  return await bcrypt.compare(candidateAppPassword, this.appPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;