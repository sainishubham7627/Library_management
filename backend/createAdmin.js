require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library-seat-mgmt')
.then(async () => {
    const exists = await Admin.findOne({ username: 'mohit' });
    if (!exists) {
        const admin = new Admin({ username: 'mohit', password: 'Bundi@0000' });
        await admin.save();
        console.log('Admin created: username: mohit');
    } else {
        console.log('Admin already exists');
    }
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
