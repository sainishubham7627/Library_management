require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const username = process.env.ADMIN_USERNAME || process.argv[2] || 'admin';
const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'admin123';

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    // Check if an admin exists
    const existingAdmin = await Admin.findOne();
    
    if (existingAdmin) {
        // Update existing admin
        existingAdmin.username = username;
        existingAdmin.password = password;
        await existingAdmin.save();
        console.log(`Admin credentials updated to username: ${username}`);
    } else {
        // Create new admin if none exists
        const admin = new Admin({ username, password });
        await admin.save();
        console.log(`Admin created with username: ${username}`);
    }
    process.exit(0);
})
.catch(err => {
    console.error('Error updating admin:', err);
    process.exit(1);
});
