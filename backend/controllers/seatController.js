const Seat = require('../models/Seat');
const Admin = require('../models/Admin');

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

exports.updateSeatConfig = async (req, res) => {
    try {
        const { normalSeatsCount, acSeatsCount, password } = req.body;

        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Get existing seats
        const existingSeats = await Seat.find({ adminId: req.admin.id });
        const existingNormal = existingSeats.filter(s => s.roomType === 'Normal');
        const existingAC = existingSeats.filter(s => s.roomType === 'AC');

        // Check if any seats to be deleted are occupied
        const normalDiff = normalSeatsCount - existingNormal.length;
        if (normalDiff < 0) {
            const seatsToRemove = existingNormal.slice(normalSeatsCount);
            for (const s of seatsToRemove) {
                if (s.occupants.full || s.occupants.morning || s.occupants.day) {
                    return res.status(400).json({ message: `Cannot decrease seats. Seat ${s.seatNumber} is currently occupied. Unassign students first.` });
                }
            }
            await Seat.deleteMany({ _id: { $in: seatsToRemove.map(s => s._id) } });
        }

        const acDiff = acSeatsCount - existingAC.length;
        if (acDiff < 0) {
            const seatsToRemove = existingAC.slice(acSeatsCount);
            for (const s of seatsToRemove) {
                if (s.occupants.full || s.occupants.morning || s.occupants.day) {
                    return res.status(400).json({ message: `Cannot decrease AC seats. Seat ${s.seatNumber} is currently occupied. Unassign students first.` });
                }
            }
            await Seat.deleteMany({ _id: { $in: seatsToRemove.map(s => s._id) } });
        }

        // Add new seats
        const seatsToCreate = [];
        if (normalDiff > 0) {
            for (let i = existingNormal.length + 1; i <= normalSeatsCount; i++) {
                seatsToCreate.push({ adminId: req.admin.id, seatNumber: `H${i}`, roomType: 'Normal' });
            }
        }
        if (acDiff > 0) {
            for (let i = existingAC.length + 1; i <= acSeatsCount; i++) {
                seatsToCreate.push({ adminId: req.admin.id, seatNumber: `AC${i < 10 ? '0' + i : i}`, roomType: 'AC' });
            }
        }

        if (seatsToCreate.length > 0) {
            await Seat.insertMany(seatsToCreate);
        }

        res.json({ message: 'Seat configuration updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
