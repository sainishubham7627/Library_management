const Seat = require('../models/Seat');

exports.initializeSeats = async (req, res) => {
    try {
        const existingSeats = await Seat.countDocuments({ adminId: req.admin.id });
        if (existingSeats > 0) {
            return res.status(400).json({ message: 'Seats already initialized' });
        }

        const seatsToCreate = [];
        // Normal Hall Seats: H1 - H49
        for (let i = 1; i <= 49; i++) {
            seatsToCreate.push({ adminId: req.admin.id, seatNumber: `H${i}`, roomType: 'Normal' });
        }
        // AC Room Seats: AC01 - AC25
        for (let i = 1; i <= 25; i++) {
            seatsToCreate.push({ adminId: req.admin.id, seatNumber: `AC${i < 10 ? '0' + i : i}`, roomType: 'AC' });
        }

        await Seat.insertMany(seatsToCreate);
        res.status(201).json({ message: 'Seats initialized successfully', count: seatsToCreate.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSeats = async (req, res) => {
    try {
        const seats = await Seat.find({ adminId: req.admin.id }).populate('occupants.morning occupants.day occupants.full', 'fullName studentId shift');
        res.json(seats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSeatDetails = async (req, res) => {
    try {
        const seat = await Seat.findOne({ adminId: req.admin.id, seatNumber: req.params.seatNumber })
            .populate('occupants.morning occupants.day occupants.full', 'fullName studentId mobileNumber shift');
        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }
        res.json(seat);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
