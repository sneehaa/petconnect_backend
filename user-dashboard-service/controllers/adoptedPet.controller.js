const AdoptedPet = require('../models/AdoptedPet');

exports.getMyAdoptedPets = async (req, res) => {
    try {
        const pets = await AdoptedPet.find({ userId: req.params.userId });
        res.status(200).json(pets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
