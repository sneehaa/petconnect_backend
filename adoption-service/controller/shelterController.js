const Shelter = require('../../model/userModel');
const Pet = require('../models/petModel');

const createShelter = async (req, res) => {
  try {
    const { name, address, phone, email, businessName, businessAddress, longitude, latitude } = req.body;

    if (!name || longitude === undefined || latitude === undefined) {
      return res.status(400).json({ message: 'Name, longitude, and latitude are required' });
    }

    const newShelter = await Shelter.create({
      name,
      email,
      phone, 
      address,
      role: 'shelter',
      businessName,
      businessAddress,
      location: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] }
    });

    res.status(201).json({ success: true, data: newShelter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getNearbyShelters = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const shelters = await Shelter.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          distanceField: 'distance',
          spherical: true,
          distanceMultiplier: 0.001
        }
      },
      { $match: { role: 'shelter' } }
    ]);

    res.status(200).json({ success: true, count: shelters.length, data: shelters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getShelterDetails = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter || shelter.role !== 'shelter') {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    const pets = await Pet.find({ shelter: shelter._id });

    res.status(200).json({ success: true, data: { shelter, pets } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateShelter = async (req, res) => {
  try {
    const updates = req.body;
    const shelter = await Shelter.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!shelter || shelter.role !== 'shelter') {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    res.status(200).json({ success: true, data: shelter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);

    if (!shelter || shelter.role !== 'shelter') {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    await Pet.deleteMany({ shelter: shelter._id });

    res.status(200).json({ success: true, message: 'Shelter and pets deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createShelter,
  getNearbyShelters,
  getShelterDetails,
  updateShelter,
  deleteShelter
};
