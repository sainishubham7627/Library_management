require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Seat = require('./models/Seat');

async function checkData() {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await Admin.find();
    console.log('Admins:', admins.map(a => a.username + ' (' + a._id + ')'));
    
    for (const admin of admins) {
        const students = await Student.countDocuments({ adminId: admin._id });
        const seats = await Seat.countDocuments({ adminId: admin._id });
        console.log(`Admin ${admin.username}: ${students} students, ${seats} seats`);
    }
    
    process.exit(0);
}
checkData();
