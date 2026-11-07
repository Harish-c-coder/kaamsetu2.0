const mongoose = require('mongoose');
const { getIsMongoConnected } = require('../config/db');
const { MemoryWorker } = require('../config/memoryStore');

const WorkerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Please select a profession or business category'],
      trim: true,
      default: 'General Handyman & Utility Services',
    },
    subCategory: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String,
      enum: ['English', 'Telugu', 'Hindi'],
      default: 'English',
    },
    state: {
      type: String,
      default: 'Telangana',
    },
    city: {
      type: String,
      default: 'Hyderabad',
    },
    locality: {
      type: String,
      required: [true, 'Please specify locality'],
      default: 'Hyderabad Central',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [78.4867, 17.3850],
        index: '2dsphere',
      },
    },
    serviceRadius: {
      type: Number,
      default: 5,
      min: 1,
      max: 50,
    },
    profileImage: {
      type: String,
      default: '',
    },
    startingPrice: {
      type: Number,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    activeShift: {
      id: { type: String, default: null },
      name: { type: String, default: 'General Shift' },
      startTime: { type: String, default: '09:00 AM' },
      endTime: { type: String, default: '08:00 PM' },
      startedAt: { type: Date, default: null },
      endsAt: { type: Date, default: null },
      durationHours: { type: Number, default: 11 },
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

WorkerSchema.index({ location: '2dsphere' });
WorkerSchema.index({ category: 1, locality: 1, isAvailable: 1 });

const MongooseWorker = mongoose.models.Worker || mongoose.model('Worker', WorkerSchema);

// Proxy that routes to real Mongoose when connected or MemoryWorker when running in dev fallback
const WorkerProxy = new Proxy(MongooseWorker, {
  get(target, prop) {
    if (!getIsMongoConnected()) {
      if (prop in MemoryWorker) {
        return MemoryWorker[prop];
      }
    }
    return target[prop];
  },
});

module.exports = WorkerProxy;
