const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Seat = require('./models/Seat');
const FeeStructure = require('./models/FeeStructure');

async function testGeneration() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clean up
    await Admin.deleteOne({ username: 'demo_admin' });
    await Seat.deleteMany({});
    await Student.deleteMany({});
    
    // Emulate authController
    let admin = new Admin({ name: 'Demo User', email: 'demo@example.com', username: 'demo_admin', password: 'demo_password123' });
    await admin.save();
    console.log('Admin saved');
    
    try {
        const fees = new FeeStructure({
            adminId: admin._id,
            morningNormal: 450, morningAC: 500,
            dayNormal: 450, dayAC: 500,
            fullNormal: 700, fullAC: 750
        });
        await fees.save();
        console.log('Fees saved');

        for (let i = 1; i <= 10; i++) {
            await new Seat({ adminId: admin._id, seatNumber: `N${i}`, roomType: 'Normal' }).save();
        }
        for (let i = 1; i <= 5; i++) {
            await new Seat({ adminId: admin._id, seatNumber: `A${i}`, roomType: 'AC' }).save();
        }
        console.log('Seats saved');

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
        console.log('Students saved');
    } catch (e) {
        console.error('ERROR DURING SEEDING:', e);
    }
    process.exit(0);
}
testGeneration();
