const FeeStructure = require('../models/FeeStructure');
const Admin = require('../models/Admin');

exports.getFeeStructure = async (req, res) => {
    try {
        let fees = await FeeStructure.findOne({ adminId: req.admin.id });
        if (!fees) {
            fees = new FeeStructure({ adminId: req.admin.id });
            await fees.save();
        }
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateFeeStructure = async (req, res) => {
    try {
        const { feesData, password } = req.body;
        
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        let fees = await FeeStructure.findOne({ adminId: req.admin.id });
        if (!fees) {
            fees = new FeeStructure({ ...feesData, adminId: req.admin.id });
            await fees.save();
        } else {
            fees = await FeeStructure.findByIdAndUpdate(fees._id, feesData, { new: true });
        }
        res.json({ message: 'Fee structure updated', fees });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
