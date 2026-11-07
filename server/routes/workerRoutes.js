const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  getWorkerDashboardStats,
} = require('../controllers/workerController');

router.route('/')
  .get(getWorkers)
  .post(createWorker);

router.route('/:id')
  .get(getWorkerById)
  .put(updateWorker);

router.route('/:id/dashboard')
  .get(getWorkerDashboardStats);

module.exports = router;
