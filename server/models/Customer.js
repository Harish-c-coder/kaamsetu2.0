const mongoose = require('mongoose');
const { getIsMongoConnected } = require('../config/db');
const { MemoryCustomer } = require('../config/memoryStore');

const CustomerSchema = new mongoose.Schema(
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    password: {
      type: String,
      default: null,
    },
    locality: {
      type: String,
      default: 'Kukatpally',
    },
    city: {
      type: String,
      default: 'Hyderabad',
    },
    state: {
      type: String,
      default: 'Telangana',
    },
    savedWorkers: {
      type: [String],
      default: [],
    },
    contactHistory: [
      {
        workerId: String,
        workerName: String,
        workerCategory: String,
        workerPhone: String,
        contactMethod: {
          type: String,
          enum: ['whatsapp', 'call'],
          default: 'whatsapp',
        },
        contactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MongooseCustomer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

const CustomerProxy = new Proxy(MongooseCustomer, {
  get(target, prop) {
    if (!getIsMongoConnected()) {
      if (prop in MemoryCustomer) {
        return MemoryCustomer[prop];
      }
    }
    return target[prop];
  },
});

module.exports = CustomerProxy;
