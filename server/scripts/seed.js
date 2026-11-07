const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, getIsMongoConnected, closeDB } = require('../config/db');
const { resetSeedData } = require('../config/memoryStore');
const Worker = require('../models/Worker');
const Listing = require('../models/Listing');
const Enquiry = require('../models/Enquiry');
const { sampleWorkers } = require('../data/seedData');

dotenv.config();

const seedDB = async (autoClose = true) => {
  try {
    if (!getIsMongoConnected()) {
      console.log('[Seed] Re-initializing in-memory dataset with Hyderabad demo data...');
      resetSeedData();
      console.log('[Seed] In-memory database refreshed successfully.');
      if (autoClose) process.exit(0);
      return;
    }

    console.log('[Seed] Clearing existing MongoDB demo data...');
    await Worker.deleteMany({});
    await Listing.deleteMany({});
    await Enquiry.deleteMany({});

    console.log(`[Seed] Inserting ${sampleWorkers.length} demo workers & listings into MongoDB...`);

    for (const workerData of sampleWorkers) {
      const { listings, ...workerFields } = workerData;
      const worker = await Worker.create(workerFields);

      if (listings && listings.length > 0) {
        const listingDocs = listings.map((l) => ({
          ...l,
          workerId: worker._id,
        }));
        await Listing.insertMany(listingDocs);
      }

      await Enquiry.create({
        workerId: worker._id,
        customerName: 'Priya Sharma (Demo)',
        customerPhone: '+919876543210',
        message: `Hello ${worker.name.split(' ')[0]}, are you available for service in ${worker.locality}?`,
        status: 'unread',
      });
    }

    console.log('[Seed] MongoDB successfully seeded with Hyderabad demo profiles!');
    if (autoClose) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    if (autoClose) {
      await closeDB();
      process.exit(1);
    }
  }
};

if (require.main === module) {
  connectDB().then(() => seedDB(true));
}

module.exports = { seedDB };
