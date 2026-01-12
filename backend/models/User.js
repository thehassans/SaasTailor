const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  logo: {
    type: String,
    default: null
  },
  subscriptionType: {
    type: String,
    enum: ['trial', 'yearly', 'lifetime'],
    default: 'trial'
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  receiptPrefix: {
    type: String,
    default: 'RCP'
  },
  receiptCounter: {
    type: Number,
    default: 1000
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'hi', 'ur', 'bn'],
    default: 'en'
  },
  whatsappEnabled: {
    type: Boolean,
    default: false
  },
  whatsappSession: {
    type: String,
    default: null
  },
  role: {
    type: String,
    default: 'user',
    immutable: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isSubscriptionActive = function() {
  if (this.subscriptionType === 'lifetime') return true;
  return new Date() < new Date(this.subscriptionEndDate);
};

userSchema.methods.generateReceiptNumber = function() {
  this.receiptCounter += 1;
  return `${this.receiptPrefix}-${this.receiptCounter}`;
};

module.exports = mongoose.model('User', userSchema);
