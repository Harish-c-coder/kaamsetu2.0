// Lightweight in-memory fallback store when local MongoDB is not running
const fs = require('fs');
const path = require('path');
const { sampleWorkers } = require('../data/seedData');

const STORE_FILE = path.join(__dirname, '../data/persisted_store.json');

let workers = [];
let listings = [];
let enquiries = [];
let customers = [];

function generateId() {
  return Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
}

function saveStore() {
  try {
    const data = {
      workers,
      listings,
      enquiries,
      customers,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // ignore
  }
}

// Initialize seed data into memory
function initSeedData() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.workers) && parsed.workers.length > 0) {
        workers = parsed.workers;
        listings = parsed.listings || [];
        enquiries = parsed.enquiries || [];
        customers = parsed.customers || [];
        return;
      }
    }
  } catch (err) {
    // fallback
  }

  workers = [];
  listings = [];
  enquiries = [];

  sampleWorkers.forEach((sw, idx) => {
    const workerId = (1000 + idx).toString();
    const { listings: wListings, ...wData } = sw;

    const workerObj = {
      ...wData,
      _id: workerId,
      createdAt: new Date(Date.now() - (idx * 3600000)),
      updatedAt: new Date(),
    };
    workers.push(workerObj);

    if (wListings && wListings.length > 0) {
      wListings.forEach((lst, lIdx) => {
        listings.push({
          ...lst,
          _id: (2000 + idx * 10 + lIdx).toString(),
          workerId: workerId,
          createdAt: new Date(Date.now() - (idx * 3600000) - (lIdx * 60000)),
          updatedAt: new Date(),
        });
      });
    }

    // Demo enquiry
    enquiries.push({
      _id: (3000 + idx).toString(),
      workerId: workerId,
      customerName: 'Priya Sharma (Demo)',
      customerPhone: '+919876543210',
      message: `Hello ${workerObj.name.split(' ')[0]}, are you available for service in ${workerObj.locality}?`,
      status: 'unread',
      createdAt: new Date(Date.now() - (idx * 7200000)),
      updatedAt: new Date(),
    });
  });

  saveStore();
}

initSeedData();

// Helper to make chainable Query object
class MemoryQuery {
  constructor(dataPromise) {
    this._promise = Promise.resolve(dataPromise);
  }

  select(fields) {
    this._promise = this._promise.then((res) => {
      if (!res) return null;
      if (Array.isArray(res)) {
        return res.map((item) => {
          const copy = { ...item };
          if (fields && fields.includes('-password')) delete copy.password;
          return copy;
        });
      }
      const copy = { ...res };
      if (fields && fields.includes('-password')) delete copy.password;
      return copy;
    });
    return this;
  }

  sort(sortCriteria) {
    this._promise = this._promise.then((res) => {
      if (!Array.isArray(res)) return res;
      const sorted = [...res];
      if (typeof sortCriteria === 'object') {
        const field = Object.keys(sortCriteria)[0];
        const dir = sortCriteria[field];
        sorted.sort((a, b) => {
          if (dir === -1) return new Date(b[field]) - new Date(a[field]);
          return new Date(a[field]) - new Date(b[field]);
        });
      }
      return sorted;
    });
    return this;
  }

  lean() {
    this._promise = this._promise.then((res) => {
      if (!res) return null;
      return JSON.parse(JSON.stringify(res));
    });
    return this;
  }

  then(resolve, reject) {
    return this._promise.then(resolve, reject);
  }

  catch(reject) {
    return this._promise.catch(reject);
  }
}

function wrapWorkerDoc(worker) {
  if (!worker) return null;
  return {
    ...worker,
    toObject: () => ({ ...worker }),
    save: async function () {
      const idx = workers.findIndex((w) => w._id.toString() === worker._id.toString());
      if (idx !== -1) {
        workers[idx] = { ...workers[idx], ...this, updatedAt: new Date() };
      } else {
        workers.push({ ...this, updatedAt: new Date() });
      }
      saveStore();
      return this;
    },
  };
}

const MemoryWorker = {
  find: (query = {}) => {
    let result = [...workers];

    if (query.category && query.category !== 'All') {
      const catLower = query.category.toLowerCase();
      result = result.filter(
        (w) =>
          (w.category && w.category.toLowerCase().includes(catLower)) ||
          (w.subCategory && w.subCategory.toLowerCase().includes(catLower))
      );
    }
    if (query.locality && query.locality.$regex) {
      const reg = new RegExp(query.locality.$regex, query.locality.$options || 'i');
      result = result.filter((w) => reg.test(w.locality));
    }
    if (query.isAvailable) {
      result = result.filter((w) => w.isAvailable === true);
    }
    if (query.startingPrice) {
      if (query.startingPrice.$gte !== undefined) {
        result = result.filter((w) => (w.startingPrice || 0) >= query.startingPrice.$gte);
      }
      if (query.startingPrice.$lte !== undefined) {
        result = result.filter((w) => (w.startingPrice || 0) <= query.startingPrice.$lte);
      }
    }
    if (query.$or) {
      result = result.filter((w) => {
        return query.$or.some((condition) => {
          for (const key of Object.keys(condition)) {
            const val = w[key];
            if (val && condition[key].$regex) {
              const reg = new RegExp(condition[key].$regex, condition[key].$options || 'i');
              if (reg.test(val)) return true;
            }
          }
          return false;
        });
      });
    }
    if (query.$and && Array.isArray(query.$and)) {
      query.$and.forEach((subClause) => {
        if (subClause.$or) {
          result = result.filter((w) => {
            return subClause.$or.some((condition) => {
              for (const key of Object.keys(condition)) {
                const val = w[key];
                if (val && condition[key].$regex) {
                  const reg = new RegExp(condition[key].$regex, condition[key].$options || 'i');
                  if (reg.test(val)) return true;
                }
              }
              return false;
            });
          });
        }
      });
    }

    return new MemoryQuery(result);
  },

  findOne: (query = {}) => {
    const promise = (async () => {
      for (const w of workers) {
        if (query._id && w._id.toString() === query._id.toString()) return wrapWorkerDoc(w);
        if (query.phone && w.phone === query.phone) return wrapWorkerDoc(w);
        if (query.$or) {
          const match = query.$or.some((cond) => {
            if (cond.phone && cond.phone === w.phone) return true;
            if (cond.phone && cond.phone.$regex) {
              const reg = new RegExp(cond.phone.$regex);
              return reg.test(w.phone);
            }
            return false;
          });
          if (match) return wrapWorkerDoc(w);
        }
      }
      return null;
    })();
    return new MemoryQuery(promise);
  },

  findById: (id) => {
    const promise = (async () => {
      let worker = workers.find((w) => w._id.toString() === id.toString());
      if (!worker) {
        // Auto-heal session worker from client localStorage after server restart
        worker = {
          _id: id.toString(),
          name: 'Partner Worker',
          phone: '+919876543210',
          category: 'Electrician',
          locality: 'Kukatpally',
          city: 'Hyderabad',
          state: 'Telangana',
          isAvailable: true,
          startingPrice: 199,
          serviceRadius: 5,
          activeShift: {
            id: 'shift_fullday',
            name: 'Full Day (9 AM – 8 PM)',
            durationHours: 11,
            startedAt: new Date(),
          },
          viewsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        workers.push(worker);
        saveStore();
      }
      return wrapWorkerDoc(worker);
    })();
    return new MemoryQuery(promise);
  },

  findByIdAndUpdate: (id, update, options = {}) => {
    const promise = (async () => {
      let idx = workers.findIndex((w) => w._id.toString() === id.toString());
      if (idx === -1) {
        const newWorker = {
          _id: id.toString(),
          name: 'Partner Worker',
          phone: '+919876543210',
          category: 'Electrician',
          locality: 'Kukatpally',
          city: 'Hyderabad',
          state: 'Telangana',
          isAvailable: true,
          startingPrice: 199,
          serviceRadius: 5,
          activeShift: {
            id: 'shift_fullday',
            name: 'Full Day (9 AM – 8 PM)',
            durationHours: 11,
            startedAt: new Date(),
          },
          viewsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        workers.push(newWorker);
        idx = workers.length - 1;
      }

      if (update.$inc && update.$inc.viewsCount) {
        workers[idx].viewsCount = (workers[idx].viewsCount || 0) + update.$inc.viewsCount;
      }

      for (const key of Object.keys(update)) {
        if (!key.startsWith('$')) {
          workers[idx][key] = update[key];
        }
      }

      workers[idx].updatedAt = new Date();
      saveStore();
      return wrapWorkerDoc(workers[idx]);
    })();
    return new MemoryQuery(promise);
  },

  create: async (doc) => {
    const newWorker = {
      ...doc,
      _id: doc._id ? doc._id.toString() : generateId(),
      viewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    workers.push(newWorker);
    saveStore();
    return wrapWorkerDoc(newWorker);
  },

  countDocuments: async () => workers.length,
  deleteMany: async () => {
    workers = [];
  },
};

const MemoryListing = {
  find: (query = {}) => {
    let result = [...listings];
    if (query.workerId) {
      result = result.filter((l) => l.workerId.toString() === query.workerId.toString());
    }
    return new MemoryQuery(result);
  },

  findById: (id) => {
    const promise = (async () => {
      const item = listings.find((l) => l._id.toString() === id.toString());
      if (!item) return null;
      return {
        ...item,
        save: async function () {
          const idx = listings.findIndex((l) => l._id.toString() === id.toString());
          if (idx !== -1) {
            listings[idx] = { ...this, updatedAt: new Date() };
          }
          return this;
        },
      };
    })();
    return new MemoryQuery(promise);
  },

  create: async (doc) => {
    const newListing = {
      ...doc,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listings.push(newListing);
    return newListing;
  },

  insertMany: async (docs) => {
    const created = docs.map((d) => ({
      ...d,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    listings.push(...created);
    return created;
  },

  findByIdAndDelete: async (id) => {
    const idx = listings.findIndex((l) => l._id.toString() === id.toString());
    if (idx === -1) return null;
    const deleted = listings.splice(idx, 1)[0];
    return deleted;
  },

  countDocuments: async (query = {}) => {
    if (query.workerId) {
      return listings.filter((l) => l.workerId.toString() === query.workerId.toString()).length;
    }
    return listings.length;
  },

  deleteMany: async () => {
    listings = [];
  },
};

const MemoryEnquiry = {
  create: async (doc) => {
    const newEnquiry = {
      ...doc,
      _id: generateId(),
      status: 'unread',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    enquiries.push(newEnquiry);
    return newEnquiry;
  },

  find: (query = {}) => {
    let result = [...enquiries];
    if (query.workerId) {
      result = result.filter((e) => e.workerId.toString() === query.workerId.toString());
    }
    return new MemoryQuery(result);
  },

  findByIdAndUpdate: async (id, update, options = {}) => {
    const idx = enquiries.findIndex((e) => e._id.toString() === id.toString());
    if (idx === -1) return null;
    enquiries[idx] = { ...enquiries[idx], ...update, updatedAt: new Date() };
    return { ...enquiries[idx] };
  },

  deleteMany: async () => {
    enquiries = [];
  },
};

const MemoryCustomer = {
  find: (query = {}) => {
    return new MemoryQuery([...customers]);
  },

  findOne: (query = {}) => {
    const promise = (async () => {
      for (const c of customers) {
        if (query._id && c._id.toString() === query._id.toString()) return { ...c };
        if (query.phone && c.phone === query.phone) return { ...c };
        if (query.email && c.email && c.email.toLowerCase() === query.email.toLowerCase()) return { ...c };
        if (query.$or) {
          const match = query.$or.some((cond) => {
            if (cond.phone && cond.phone === c.phone) return true;
            if (cond.phone && cond.phone.$regex) {
              const reg = new RegExp(cond.phone.$regex);
              if (reg.test(c.phone)) return true;
            }
            if (cond.email && c.email && cond.email.toLowerCase() === c.email.toLowerCase()) return true;
            if (cond.name && c.name && cond.name.toLowerCase() === c.name.toLowerCase()) return true;
            return false;
          });
          if (match) return { ...c };
        }
      }
      return null;
    })();
    return new MemoryQuery(promise);
  },

  findById: (id) => {
    const promise = (async () => {
      const c = customers.find((cust) => cust._id.toString() === id.toString());
      if (!c) return null;
      return {
        ...c,
        toObject: () => ({ ...c }),
        save: async function () {
          const idx = customers.findIndex((cust) => cust._id.toString() === id.toString());
          if (idx !== -1) customers[idx] = { ...this, updatedAt: new Date() };
          return this;
        },
      };
    })();
    return new MemoryQuery(promise);
  },

  findByIdAndUpdate: (id, update, options = {}) => {
    const promise = (async () => {
      const idx = customers.findIndex((c) => c._id.toString() === id.toString());
      if (idx === -1) return null;

      for (const key of Object.keys(update)) {
        if (!key.startsWith('$')) {
          customers[idx][key] = update[key];
        }
      }
      if (update.$addToSet) {
        for (const field of Object.keys(update.$addToSet)) {
          if (!Array.isArray(customers[idx][field])) customers[idx][field] = [];
          if (!customers[idx][field].includes(update.$addToSet[field])) {
            customers[idx][field].push(update.$addToSet[field]);
          }
        }
      }
      if (update.$push) {
        for (const field of Object.keys(update.$push)) {
          if (!Array.isArray(customers[idx][field])) customers[idx][field] = [];
          customers[idx][field].unshift(update.$push[field]);
        }
      }

      customers[idx].updatedAt = new Date();
      return { ...customers[idx], toObject: () => ({ ...customers[idx] }) };
    })();
    return new MemoryQuery(promise);
  },

  create: async (doc) => {
    const newCustomer = {
      ...doc,
      _id: generateId(),
      savedWorkers: doc.savedWorkers || [],
      contactHistory: doc.contactHistory || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    customers.push(newCustomer);
    return {
      ...newCustomer,
      toObject: () => ({ ...newCustomer }),
      save: async function () {
        const idx = customers.findIndex((c) => c._id.toString() === newCustomer._id.toString());
        if (idx !== -1) customers[idx] = { ...this, updatedAt: new Date() };
        return this;
      },
    };
  },

  countDocuments: async () => customers.length,
};

module.exports = {
  MemoryWorker,
  MemoryListing,
  MemoryEnquiry,
  MemoryCustomer,
  resetSeedData: initSeedData,
};
