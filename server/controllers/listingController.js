const Listing = require('../models/Listing');
const Worker = require('../models/Worker');

// @desc    Get listings for a specific worker
// @route   GET /api/listings/worker/:workerId
// @access  Public
const getWorkerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message,
    });
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Public / Protected
const createListing = async (req, res) => {
  try {
    const { workerId, title, category, description, price, image, listingType, isAvailable, locality } = req.body;

    if (!workerId || !title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID, Title, and Category are required',
      });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    const listing = await Listing.create({
      workerId,
      title: title.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      price: price ? Number(price) : null,
      image: image || '',
      listingType: listingType || 'service',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      locality: locality || worker.locality,
    });

    return res.status(201).json({
      success: true,
      message: 'Listing published successfully',
      data: listing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message,
    });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Public / Protected
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    const { title, category, description, price, image, listingType, isAvailable, locality } = req.body;

    if (title) listing.title = title.trim();
    if (category) listing.category = category.trim();
    if (description !== undefined) listing.description = description.trim();
    if (price !== undefined) listing.price = price ? Number(price) : null;
    if (image !== undefined) listing.image = image;
    if (listingType) listing.listingType = listingType;
    if (isAvailable !== undefined) listing.isAvailable = Boolean(isAvailable);
    if (locality) listing.locality = locality.trim();

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update listing',
      error: error.message,
    });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Public / Protected
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: error.message,
    });
  }
};

module.exports = {
  getWorkerListings,
  createListing,
  updateListing,
  deleteListing,
};
