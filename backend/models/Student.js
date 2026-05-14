const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, match: [/^\d{10}$/, 'Mobile number must be 10 digits'] },
    studentId: { type: String, required: true, unique: true, match: [/^S\d+$/, 'Student ID must start with S followed by numbers'] },
    address: { type: String, required: true },
    profilePhoto: { type: String }, // URL or path
    shift: { type: String, enum: ['Morning', 'Day', 'Full Shift'], required: true },
    roomType: { type: String, enum: ['Normal', 'AC'], required: true },
    seatNumber: { type: String, required: true },
    joiningDate: { type: Date, default: Date.now },
    remark: { type: String },
    fee: {
        total: { type: Number, required: true, min: [0, 'Total fee cannot be negative'] },
        paid: { type: Number, default: 0, min: [0, 'Paid amount cannot be negative'] },
        remaining: { type: Number, required: true, min: [0, 'Remaining fee cannot be negative'] },
        status: { type: String, enum: ['Paid', 'Pending', 'Partial Paid'], default: 'Pending' },
        paymentHistory: [{
            amount: Number,
            date: { type: Date, default: Date.now },
            method: { type: String, enum: ['Cash', 'UPI', 'Other'] }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
