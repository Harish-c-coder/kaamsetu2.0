const mongoose = require('mongoose');
const { getIsMongoConnected } = require('../config/db');
const { MemoryListing } = require('../config/memoryStore');

const ListingSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide listing title'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    listingType: {
      type: String,
      enum: ['service', 'product'],
      default: 'service',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    locality: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ workerId: 1, listingType: 1 });

const MongooseListing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

const ListingProxy = new Proxy(MongooseListing, {
  get(target, prop) {
    if (!getIsMongoConnected()) {
      if (prop in MemoryListing) {
        return MemoryListing[prop];
      }
    }
    return target[prop];
  },
});

module.exports = ListingProxy;
