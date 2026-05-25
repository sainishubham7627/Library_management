require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Seat = require('./models/Seat');

async function fixMohit() {
    await mongoose.connect(process.env.MONGO_URI);
    const mohit = await Admin.findOne({ username: 'mohit' });
    if (!mohit) {
        console.log('Mohit not found!');
        process.exit(1);
    }
    
    const count = await Seat.countDocuments({ adminId: mohit._id });
    if (count > 0) {
        console.log('Seats already initialized for mohit');
    } else {
        const seatsToCreate = [];
        for (let i = 1; i <= 49; i++) {
            seatsToCreate.push({ adminId: mohit._id, seatNumber: `H${i}`, roomType: 'Normal' });
        }
        for (let i = 1; i <= 25; i++) {
            seatsToCreate.push({ adminId: mohit._id, seatNumber: `AC${i < 10 ? '0' + i : i}`, roomType: 'AC' });
        }
        await Seat.insertMany(seatsToCreate);
        console.log('Successfully initialized 74 seats for mohit!');
    }
    process.exit(0);
}
fixMohit();
