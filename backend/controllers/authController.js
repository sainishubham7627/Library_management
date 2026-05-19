const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Seat = require('../models/Seat');
const FeeStructure = require('../models/FeeStructure');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists with this username or email' });
        }
        const admin = new Admin({ name, email, username, password });
        await admin.save();
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
        res.status(201).json({ message: 'Admin created successfully', token, admin: { username: admin.username, name: admin.name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
        res.json({ token, admin: { username: admin.username } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const adminId = req.admin.id;

        // Verify admin exists
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.username === 'demo_admin') {
            return res.status(403).json({ message: 'Cannot delete the shared demo account' });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Delete all associated data
        await Student.deleteMany({ adminId });
        await Seat.deleteMany({ adminId });

        // Delete admin account
        await Admin.findByIdAndDelete(adminId);

        res.json({ message: 'Account and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.startDemo = async (req, res) => {
    try {
        let admin = await Admin.findOne({ username: 'demo_admin' });
        
        if (!admin) {
            admin = new Admin({ name: 'Demo User', email: 'demo@example.com', username: 'demo_admin', password: 'demo_password123' });
            await admin.save();
            
            const fees = new FeeStructure({
                adminId: admin._id,
                morningNormal: 450, morningAC: 500,
                dayNormal: 450, dayAC: 500,
                fullNormal: 700, fullAC: 750
            });
            await fees.save();

            for (let i = 1; i <= 5; i++) {
                await new Seat({ adminId: admin._id, seatNumber: `N${i}`, roomType: 'Normal' }).save();
            }

            const seat1 = await Seat.findOne({ adminId: admin._id, seatNumber: 'N1' });
            const student = new Student({
                adminId: admin._id,
                fullName: 'Rahul Sharma',
                mobileNumber: '9876543210',
                studentId: 'S01',
                address: 'New Delhi',
                shift: 'Full Shift',
                roomType: 'Normal',
                seatNumber: 'N1',
                joiningDate: new Date(),
                fee: { total: 700, paid: 700, remaining: 0, status: 'Paid', paymentHistory: [{ amount: 700, method: 'UPI' }] }
            });
            await student.save();
            if(seat1) {
                seat1.occupants.full = student._id;
                await seat1.save();
            }
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
        res.json({ token, admin: { username: admin.username, name: admin.name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
