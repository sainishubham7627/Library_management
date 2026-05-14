require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    // Check if an admin exists
    const existingAdmin = await Admin.findOne();
    
    if (existingAdmin) {
        // Update existing admin
        existingAdmin.username = 'mohit';
        existingAdmin.password = 'Bundi@0000';
        await existingAdmin.save();
        console.log('Admin credentials updated to username: mohit');
    } else {
        // Create new admin if none exists
        const admin = new Admin({ username: 'mohit', password: 'Bundi@0000' });
        await admin.save();
        console.log('Admin created with username: mohit');
    }
    process.exit(0);
})
.catch(err => {
    console.error('Error updating admin:', err);
    process.exit(1);
});
