const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    seatNumber: { type: String, required: true }, // e.g., H1, AC01
    roomType: { type: String, enum: ['Normal', 'AC'], required: true },
    occupants: {
        morning: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }, // 6 AM - 2 PM
        day: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },     // 2 PM - 10 PM
        full: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }     // 6 AM - 10 PM
    }
}, { timestamps: true });

seatSchema.index({ adminId: 1, seatNumber: 1 }, { unique: true });

// Helper virtual to check if available for a specific shift
seatSchema.methods.isAvailableFor = function(shift) {
    if (this.occupants.full) return false;
    if (shift === 'Full Shift') {
        return !this.occupants.morning && !this.occupants.day && !this.occupants.full;
    }
    if (shift === 'Morning') {
        return !this.occupants.morning;
    }
    if (shift === 'Day') {
        return !this.occupants.day;
    }
    return false;
};

module.exports = mongoose.model('Seat', seatSchema);
