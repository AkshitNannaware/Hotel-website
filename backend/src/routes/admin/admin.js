const express = require('express');
const Booking = require('../../models/Booking');
const Room = require('../../models/Room');
const Service = require('../../models/Service');
const User = require('../../models/User');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { requireDb } = require('../../middleware/requireDb');

const router = express.Router();

router.use(requireDb, requireAuth, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [totalRooms, availableRooms, totalBookings, confirmedBookings, bookings] =
      await Promise.all([
        Room.countDocuments(),
        Room.countDocuments({ available: true }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.find({}, { totalPrice: 1, status: 1 }).lean(),
      ]);

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const occupiedCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked-in').length;

    const stats = {
      totalRooms,
      availableRooms,
      totalBookings,
      confirmedBookings,
      totalRevenue,
      occupancyRate: totalRooms === 0 ? 0 : Number(((occupiedCount / totalRooms) * 100).toFixed(1)),
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Rooms CRUD
router.get('/rooms', async (req, res, next) => {
  try {
    const rooms = await Room.find().lean();
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

router.post('/rooms', async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
});

router.put('/rooms/:id', async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    next(err);
  }
});

router.delete('/rooms/:id', async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
});

// Services CRUD
router.get('/services', async (req, res, next) => {
  try {
    const services = await Service.find().lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
});

router.post('/services', async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

router.put('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    next(err);
  }
});

router.delete('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
});

// Bookings list and status update
router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find().lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.patch('/bookings/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.patch('/bookings/:id/id-verified', async (req, res, next) => {
  try {
    const { idVerified } = req.body;
    const allowed = ['pending', 'approved', 'rejected'];

    if (!allowed.includes(idVerified)) {
      return res.status(400).json({ message: 'Invalid ID verification status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { idVerified },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// Users list and role update
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true, select: '-passwordHash' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

