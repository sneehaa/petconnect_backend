const UserProfile = require('../models/UserProfile');

exports.getProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.params.userId });
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true, upsert: true }
        );
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
