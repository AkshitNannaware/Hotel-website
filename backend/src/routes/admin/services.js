const express = require('express');
const Service = require('../../models/Service');
const { requireDb } = require('../../middleware/requireDb');

const router = express.Router();

router.use(requireDb);

// GET /api/services
router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find().lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

