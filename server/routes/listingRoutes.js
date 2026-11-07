const express = require('express');
const router = express.Router();
const {
  getWorkerListings,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');

router.route('/')
  .post(createListing);

router.route('/:id')
  .put(updateListing)
  .delete(deleteListing);

router.route('/worker/:workerId')
  .get(getWorkerListings);

module.exports = router;
