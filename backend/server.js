require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const seatRoutes = require('./routes/seatRoutes');
const feeRoutes = require('./routes/feeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/fees', feeRoutes);

// Health check route for Render/Vercel
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Jagannath Library Backend is running successfully!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library-seat-mgmt')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
