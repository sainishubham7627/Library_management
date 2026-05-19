const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
    morningNormal: { type: Number, default: 450 },
    morningAC: { type: Number, default: 500 },
    dayNormal: { type: Number, default: 450 },
    dayAC: { type: Number, default: 500 },
    fullNormal: { type: Number, default: 700 },
    fullAC: { type: Number, default: 750 }
}, { timestamps: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
