const mongoose = require('mongoose');
const { getIsMongoConnected } = require('../config/db');
const { MemoryEnquiry } = require('../config/memoryStore');

const EnquirySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseEnquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);

const EnquiryProxy = new Proxy(MongooseEnquiry, {
  get(target, prop) {
    if (!getIsMongoConnected()) {
      if (prop in MemoryEnquiry) {
        return MemoryEnquiry[prop];
      }
    }
    return target[prop];
  },
});

module.exports = EnquiryProxy;
