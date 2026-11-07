const Enquiry = require('../models/Enquiry');
const Worker = require('../models/Worker');

// @desc    Submit an enquiry for a worker
// @route   POST /api/enquiries
// @access  Public
const submitEnquiry = async (req, res) => {
  try {
    const { workerId, customerName, customerPhone, message } = req.body;

    if (!workerId || !customerName || !customerPhone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workerId, customerName, customerPhone, and message',
      });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    const enquiry = await Enquiry.create({
      workerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      message: message.trim(),
      status: 'unread',
    });

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. The worker has been notified!',
      data: enquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message,
    });
  }
};

// @desc    Get enquiries for a specific worker
// @route   GET /api/enquiries/worker/:workerId
// @access  Public / Protected
const getWorkerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enquiries',
      error: error.message,
    });
  }
};

// @desc    Update enquiry status (mark as read or replied)
// @route   PUT /api/enquiries/:id/status
// @access  Public / Protected
const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be unread, read, or replied',
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry status updated',
      data: enquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update enquiry status',
      error: error.message,
    });
  }
};

module.exports = {
  submitEnquiry,
  getWorkerEnquiries,
  updateEnquiryStatus,
};
