require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const username = process.env.ADMIN_USERNAME || process.argv[2] || 'admin';
const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'admin123';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library-seat-mgmt')
.then(async () => {
    const exists = await Admin.findOne({ username });
    if (!exists) {
        const admin = new Admin({ username, password });
        await admin.save();
        console.log(`Admin created: username: ${username}`);
    } else {
        console.log('Admin already exists');
    }
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
