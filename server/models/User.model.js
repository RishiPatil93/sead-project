const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['instructor', 'student'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null, // Will be assigned on first login for cursor color
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Assign a random cursor color on creation if not set
userSchema.pre('save', function (next) {
  if (!this.color) {
    const colors = [
      '#58a6ff', '#3fb950', '#bc8cff', '#f78166',
      '#ffa657', '#79c0ff', '#56d364', '#d2a8ff',
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
