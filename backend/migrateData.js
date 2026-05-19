const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Seat = require('./models/Seat');
const FeeStructure = require('./models/FeeStructure');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library-seat-mgmt')
.then(async () => {
    // Find the original admin
    const mohitAdmin = await Admin.findOne({ username: 'mohit' });
    if (!mohitAdmin) {
        console.log("Mohit admin not found. Cannot migrate.");
        process.exit(0);
    }

    const adminId = mohitAdmin._id;

    // Migrate Students
    const studentRes = await Student.updateMany(
        { adminId: { $exists: false } },
        { $set: { adminId } }
    );
    console.log(`Migrated ${studentRes.modifiedCount} students.`);

    // Migrate Seats
    const seatRes = await Seat.updateMany(
        { adminId: { $exists: false } },
        { $set: { adminId } }
    );
    console.log(`Migrated ${seatRes.modifiedCount} seats.`);

    // Migrate FeeStructure
    const feeRes = await FeeStructure.updateMany(
        { adminId: { $exists: false } },
        { $set: { adminId } }
    );
    console.log(`Migrated ${feeRes.modifiedCount} fee structures.`);

    console.log("Migration complete!");
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
