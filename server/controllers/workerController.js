const Worker = require('../models/Worker');
const Listing = require('../models/Listing');
const Enquiry = require('../models/Enquiry');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/authMiddleware');

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// @desc    Get all workers with search, filters, and distance calculation
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res) => {
  try {
    const {
      search,
      category,
      locality,
      isAvailable,
      minPrice,
      maxPrice,
      lat,
      lng,
      maxDistance, // in km
      sort = 'nearest',
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { category: { $regex: category, $options: 'i' } },
          { subCategory: { $regex: category, $options: 'i' } },
        ],
      });
    }

    if (locality && locality.trim() !== '') {
      query.locality = { $regex: locality.trim(), $options: 'i' };
    }

    if (isAvailable === 'true' || isAvailable === true) {
      query.isAvailable = true;
    }

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      const searchConditions = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { subCategory: { $regex: term, $options: 'i' } },
        { locality: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
      ];
      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else {
        query.$or = searchConditions;
      }
    }

    const customerLat = lat ? parseFloat(lat) : null;
    const customerLng = lng ? parseFloat(lng) : null;
    const maxDist = maxDistance ? parseFloat(maxDistance) : 50;

    let workers = await Worker.find(query).select('-password').lean();

    // Attach computed distance if customer coordinates are provided
    if (customerLat !== null && customerLng !== null && !isNaN(customerLat) && !isNaN(customerLng)) {
      workers = workers
        .map((w) => {
          const wLng = w.location?.coordinates?.[0];
          const wLat = w.location?.coordinates?.[1];
          const dist = calculateDistanceKm(customerLat, customerLng, wLat, wLng);
          return { ...w, distanceKm: dist };
        })
        .filter((w) => {
          if (w.distanceKm === null) return true;
          return w.distanceKm <= maxDist;
        });

      if (sort === 'nearest') {
        workers.sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });
      }
    }

    if (sort === 'price_asc') {
      workers.sort((a, b) => (a.startingPrice || 999999) - (b.startingPrice || 999999));
    } else if (sort === 'price_desc') {
      workers.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
    } else if (sort === 'views') {
      workers.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (sort === 'newest') {
      workers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching workers',
      error: error.message,
    });
  }
};

// @desc    Get single worker by ID and increment views
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    const listings = await Listing.find({ workerId: worker._id });

    return res.status(200).json({
      success: true,
      data: {
        ...worker.toObject(),
        listings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching worker profile',
      error: error.message,
    });
  }
};

// @desc    Register new worker
// @route   POST /api/workers
// @access  Public
const createWorker = async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      category,
      description,
      language,
      state,
      city,
      locality,
      latitude,
      longitude,
      serviceRadius,
      profileImage,
      startingPrice,
      isAvailable,
      activeShift,
    } = req.body;

    if (!name || !phone || !category || !locality) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, category, and locality',
      });
    }

    // Format phone to clean standard
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        cleanPhone = '+' + cleanPhone;
      }
    }

    let hashedPassword = null;
    if (password && password.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Coordinates fallback to Hyderabad default if invalid
    const lng = longitude !== undefined && !isNaN(longitude) ? Number(longitude) : 78.4867;
    const lat = latitude !== undefined && !isNaN(latitude) ? Number(latitude) : 17.3850;

    const worker = await Worker.create({
      name: name.trim(),
      phone: cleanPhone,
      password: hashedPassword,
      category,
      description: description ? description.trim() : '',
      language: language || 'English',
      state: state || 'Telangana',
      city: city || 'Hyderabad',
      locality: locality.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      serviceRadius: serviceRadius ? Number(serviceRadius) : 5,
      profileImage: profileImage || '',
      startingPrice: startingPrice ? Number(startingPrice) : null,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const token = generateToken(worker._id);

    return res.status(201).json({
      success: true,
      message: 'Worker profile created and published successfully',
      data: {
        _id: worker._id,
        name: worker.name,
        phone: worker.phone,
        category: worker.category,
        description: worker.description,
        locality: worker.locality,
        city: worker.city,
        state: worker.state,
        language: worker.language,
        startingPrice: worker.startingPrice,
        isAvailable: worker.isAvailable,
        profileImage: worker.profileImage,
        location: worker.location,
        serviceRadius: worker.serviceRadius,
        token,
      },
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create worker profile',
      error: error.message,
    });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/:id
// @access  Public (or protected)
const updateWorker = async (req, res) => {
  try {
    const workerId = req.params.id;
    let worker = await Worker.findById(workerId);

    if (!worker) {
      worker = await Worker.create({
        _id: workerId,
        name: req.body.name || 'Partner Worker',
        phone: req.body.phone || '+919876543210',
        category: req.body.category || 'Electrician',
        locality: req.body.locality || 'Kukatpally',
        city: 'Hyderabad',
        isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
      });
    }

    const {
      name,
      phone,
      category,
      description,
      language,
      state,
      city,
      locality,
      latitude,
      longitude,
      serviceRadius,
      profileImage,
      startingPrice,
      isAvailable,
      activeShift,
    } = req.body;

    if (name) worker.name = name.trim();
    if (phone) {
      let cleanPhone = phone.replace(/[^\d+]/g, '');
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
      }
      worker.phone = cleanPhone;
    }
    if (category) worker.category = category;
    if (description !== undefined) worker.description = description.trim();
    if (language) worker.language = language;
    if (state) worker.state = state;
    if (city) worker.city = city;
    if (locality) worker.locality = locality.trim();
    if (serviceRadius !== undefined) worker.serviceRadius = Number(serviceRadius);
    if (profileImage !== undefined) worker.profileImage = profileImage;
    if (startingPrice !== undefined) worker.startingPrice = startingPrice ? Number(startingPrice) : null;
    if (isAvailable !== undefined) worker.isAvailable = Boolean(isAvailable);
    if (activeShift !== undefined) worker.activeShift = activeShift;

    if (longitude !== undefined && latitude !== undefined && !isNaN(longitude) && !isNaN(latitude)) {
      worker.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    await worker.save();

    return res.status(200).json({
      success: true,
      message: 'Worker profile updated and published successfully',
      data: worker,
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update worker profile',
      error: error.message,
    });
  }
};

// @desc    Get worker dashboard metrics
// @route   GET /api/workers/:id/dashboard
// @access  Public / Protected
const getWorkerDashboardStats = async (req, res) => {
  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) {
      worker = await Worker.create({
        _id: req.params.id,
        name: 'Partner Worker',
        phone: '+919876543210',
        category: 'Electrician',
        locality: 'Kukatpally',
        city: 'Hyderabad',
        isAvailable: true,
      });
    }

    const listingsCount = await Listing.countDocuments({ workerId: worker._id });
    const enquiries = await Enquiry.find({ workerId: worker._id }).sort({ createdAt: -1 });

    // Calculate profile completion percentage based on filled fields
    let filledFields = 0;
    const totalFields = 9;
    if (worker.name) filledFields++;
    if (worker.phone) filledFields++;
    if (worker.category) filledFields++;
    if (worker.description && worker.description.length > 15) filledFields++;
    if (worker.locality) filledFields++;
    if (worker.profileImage) filledFields++;
    if (worker.startingPrice) filledFields++;
    if (worker.location && worker.location.coordinates?.length === 2) filledFields++;
    if (listingsCount > 0) filledFields++;

    const profileCompletion = Math.min(100, Math.round((filledFields / totalFields) * 100));

    return res.status(200).json({
      success: true,
      data: {
        worker,
        stats: {
          profileCompletion,
          isAvailable: worker.isAvailable,
          viewsCount: worker.viewsCount || 0,
          enquiriesCount: enquiries.length,
          unreadEnquiriesCount: enquiries.filter((e) => e.status === 'unread').length,
          listingsCount,
        },
        recentEnquiries: enquiries.slice(0, 5),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve worker dashboard stats',
      error: error.message,
    });
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  getWorkerDashboardStats,
};
