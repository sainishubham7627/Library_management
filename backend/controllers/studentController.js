const Student = require('../models/Student');
const Seat = require('../models/Seat');

const FeeStructure = require('../models/FeeStructure');

const getDynamicFee = async (shift, roomType) => {
    let fees = await FeeStructure.findOne();
    if (!fees) fees = new FeeStructure(); // fallback defaults
    
    if (shift === 'Morning') return roomType === 'AC' ? fees.morningAC : fees.morningNormal;
    if (shift === 'Day') return roomType === 'AC' ? fees.dayAC : fees.dayNormal;
    return roomType === 'AC' ? fees.fullAC : fees.fullNormal;
};

exports.addStudent = async (req, res) => {
    try {
        const { fullName, mobileNumber, studentId, address, shift, roomType, seatNumber, amountPaid, paymentMethod, remark, isPayLater } = req.body;

        // Check if student exists
        const existingStudent = await Student.findOne({ studentId });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        // Validate Seat
        const seat = await Seat.findOne({ seatNumber, roomType });
        if (!seat) {
            return res.status(400).json({ message: 'Invalid seat or room type mismatch' });
        }

        // Check availability
        if (seat.occupants.full) {
            return res.status(400).json({ message: 'Seat already occupied by a Full Shift student' });
        }
        if (shift === 'Full Shift') {
            if (seat.occupants.morning || seat.occupants.day) {
                return res.status(400).json({ message: 'Seat already partially occupied, cannot assign to Full Shift' });
            }
        } else if (shift === 'Morning' && seat.occupants.morning) {
            return res.status(400).json({ message: 'Seat already occupied for Morning shift' });
        } else if (shift === 'Day' && seat.occupants.day) {
            return res.status(400).json({ message: 'Seat already occupied for Day shift' });
        }

        // Calculate Fees
        const totalFee = await getDynamicFee(shift, roomType);
        const paid = isPayLater ? 0 : (amountPaid ? parseFloat(amountPaid) : 0);
        const remaining = totalFee - paid;
        let status = 'Pending';
        if (remaining <= 0) status = 'Paid';
        else if (paid > 0) status = 'Partial Paid';

        const paymentHistory = [];
        if (paid > 0) {
            paymentHistory.push({ amount: paid, method: paymentMethod || 'Cash' });
        }

        const student = new Student({
            fullName, mobileNumber, studentId, address, shift, roomType, seatNumber,
            remark,
            fee: { total: totalFee, paid, remaining, status, paymentHistory }
        });

        await student.save();

        // Update Seat
        if (shift === 'Full Shift') seat.occupants.full = student._id;
        else if (shift === 'Morning') seat.occupants.morning = student._id;
        else if (shift === 'Day') seat.occupants.day = student._id;
        
        await seat.save();

        res.status(201).json({ message: 'Student added successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const { search, shift, status, roomType } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } },
                { seatNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (shift) query.shift = shift;
        if (status) query['fee.status'] = status;
        if (roomType) query.roomType = roomType;

        const students = await Student.find(query).sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Prevent manipulation of restricted fields
        delete updateData.fee;
        delete updateData.shift;
        delete updateData.roomType;
        delete updateData.seatNumber;
        
        // Handle studentId uniqueness
        if (updateData.studentId && updateData.studentId !== student.studentId) {
            const existing = await Student.findOne({ studentId: updateData.studentId });
            if (existing) {
                return res.status(400).json({ message: 'Student ID already in use' });
            }
        }
        
        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        res.json({ message: 'Student updated successfully', updatedStudent });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Free up seat
        const seat = await Seat.findOne({ seatNumber: student.seatNumber });
        if (seat) {
            if (seat.occupants.full && seat.occupants.full.toString() === id) seat.occupants.full = null;
            if (seat.occupants.morning && seat.occupants.morning.toString() === id) seat.occupants.morning = null;
            if (seat.occupants.day && seat.occupants.day.toString() === id) seat.occupants.day = null;
            await seat.save();
        }

        await Student.findByIdAndDelete(id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, method } = req.body;
        
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const paidAmount = parseFloat(amount);
        if (isNaN(paidAmount) || paidAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        if (paidAmount > student.fee.remaining) {
            return res.status(400).json({ message: 'Payment amount exceeds remaining balance' });
        }

        student.fee.paid += paidAmount;
        student.fee.remaining = student.fee.total - student.fee.paid;
        
        if (student.fee.remaining <= 0) {
            student.fee.status = 'Paid';
        } else {
            student.fee.status = 'Partial Paid';
        }

        student.fee.paymentHistory.push({ amount: paidAmount, method: method || 'Cash' });
        await student.save();

        res.json({ message: 'Payment added successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalStudentsCount = await Student.countDocuments();
        
        // Count occupied seats
        const seats = await Seat.find();
        let occupiedSeats = 0;
        let availableSeats = 0;

        seats.forEach(seat => {
            if (seat.occupants.full || (seat.occupants.morning && seat.occupants.day)) {
                occupiedSeats++;
            } else if (!seat.occupants.full && !seat.occupants.morning && !seat.occupants.day) {
                availableSeats++;
            } else {
                // Partially occupied counts as occupied? Let's say available if it can take another shift.
                // Or maybe just sum total capacity vs used capacity.
                // Let's do: totally full = occupied, partially empty = available
                availableSeats++;
            }
        });

        // Pending payments
        const pendingPaymentsCount = await Student.countDocuments({ 'fee.status': { $in: ['Pending', 'Partial Paid'] } });

        res.json({
            totalStudents: totalStudentsCount,
            occupiedSeats,
            availableSeats,
            pendingPayments: pendingPaymentsCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
