const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getWorkerEnquiries,
  updateEnquiryStatus,
} = require('../controllers/enquiryController');

router.route('/')
  .post(submitEnquiry);

router.route('/worker/:workerId')
  .get(getWorkerEnquiries);

router.route('/:id/status')
  .put(updateEnquiryStatus);

module.exports = router;
