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

            for (let i = 1; i <= 10; i++) {
                await new Seat({ adminId: admin._id, seatNumber: `N${i}`, roomType: 'Normal' }).save();
            }
            for (let i = 1; i <= 5; i++) {
                await new Seat({ adminId: admin._id, seatNumber: `A${i}`, roomType: 'AC' }).save();
            }

            const now = new Date();
            const past28Days = new Date(now); past28Days.setDate(past28Days.getDate() - 28);
            const past15Days = new Date(now); past15Days.setDate(past15Days.getDate() - 15);
            const past3Days = new Date(now); past3Days.setDate(past3Days.getDate() - 3);

            const demoStudents = [
                {
                    adminId: admin._id, fullName: 'Rahul Sharma', mobileNumber: '9876543210', studentId: 'S01',
                    address: 'New Delhi', shift: 'Full Shift', roomType: 'Normal', seatNumber: 'N1', joiningDate: past3Days,
                    fee: { total: 700, paid: 700, remaining: 0, status: 'Paid', paymentHistory: [{ amount: 700, method: 'UPI' }] }
                },
                {
                    adminId: admin._id, fullName: 'Priya Patel', mobileNumber: '9988776655', studentId: 'S02',
                    address: 'Mumbai', shift: 'Morning', roomType: 'Normal', seatNumber: 'N2', joiningDate: past15Days,
                    fee: { total: 450, paid: 200, remaining: 250, status: 'Pending', paymentHistory: [{ amount: 200, method: 'Cash' }] }
                },
                {
                    adminId: admin._id, fullName: 'Amit Kumar', mobileNumber: '9123456789', studentId: 'S03',
                    address: 'Pune', shift: 'Day', roomType: 'AC', seatNumber: 'A1', joiningDate: past28Days,
                    fee: { total: 500, paid: 500, remaining: 0, status: 'Paid', paymentHistory: [{ amount: 500, method: 'Other' }] }
                },
                {
                    adminId: admin._id, fullName: 'Sneha Gupta', mobileNumber: '9876123450', studentId: 'S04',
                    address: 'Bangalore', shift: 'Full Shift', roomType: 'AC', seatNumber: 'A2', joiningDate: now,
                    fee: { total: 750, paid: 0, remaining: 750, status: 'Pending', paymentHistory: [] }
                }
            ];

            for (const sData of demoStudents) {
                const student = new Student(sData);
                await student.save();
                const seat = await Seat.findOne({ adminId: admin._id, seatNumber: sData.seatNumber });
                if (seat) {
                    if (sData.shift === 'Full Shift') seat.occupants.full = student._id;
                    else if (sData.shift === 'Morning') seat.occupants.morning = student._id;
                    else if (sData.shift === 'Day') seat.occupants.day = student._id;
                    await seat.save();
                }
            }
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
        res.json({ token, admin: { username: admin.username, name: admin.name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
