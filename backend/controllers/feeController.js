const FeeStructure = require('../models/FeeStructure');

exports.getFeeStructure = async (req, res) => {
    try {
        let fees = await FeeStructure.findOne();
        if (!fees) {
            fees = new FeeStructure();
            await fees.save();
        }
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateFeeStructure = async (req, res) => {
    try {
        let fees = await FeeStructure.findOne();
        if (!fees) {
            fees = new FeeStructure(req.body);
            await fees.save();
        } else {
            fees = await FeeStructure.findByIdAndUpdate(fees._id, req.body, { new: true });
        }
        res.json({ message: 'Fee structure updated', fees });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
