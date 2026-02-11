const express = require('express');
const Booking = require('../../models/Booking');
const { requireDb } = require('../../middleware/requireDb');

const router = express.Router();

router.use(requireDb);

// Shape is based on BookingContext Booking interface
// POST /api/bookings
router.post('/', async (req, res, next) => {
  const {
    roomId,
    checkIn,
    checkOut,
    guests,
    rooms,
    totalPrice,
    roomPrice,
    taxes,
    serviceCharges,
    guestName,
    guestEmail,
    guestPhone,
    userId = '1',
  } = req.body;

  try {
    if (
      !roomId ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !rooms ||
      !totalPrice ||
      !roomPrice ||
      !taxes ||
      !serviceCharges ||
      !guestName ||
      !guestEmail ||
      !guestPhone
    ) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const booking = await Booking.create({
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      rooms,
      totalPrice,
      roomPrice,
      taxes,
      serviceCharges,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      status: 'confirmed',
      paymentStatus: 'pending',
      bookingDate: new Date(),
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings
router.get('/', async (req, res, next) => {
  try {
    const bookings = await Booking.find().lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', async (req, res, next) => {
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

module.exports = router;

