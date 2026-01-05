const Adoption = require('../models/adoptionModel');
const Pet = require('../models/petModel');

const applyAdoption = async (req, res) => {
  try {
    const { id } = req.params; // petId
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const adoptionData = {
      pet: id,
      user: req.user._id,
      status: 'pending', // initial status
      ...req.body
    };

    const adoption = await Adoption.create(adoptionData);
    res.status(201).json({ message: 'Adoption application submitted', adoption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAdoptionStatus = async (req, res) => {
  try {
    const { id } = req.params; // petId
    const adoption = await Adoption.findOne({ pet: id, user: req.user._id })
      .populate('pet')
      .populate('user', '-password');

    if (!adoption) return res.status(404).json({ message: 'No adoption application found' });

    res.json({ message: 'Adoption status fetched', adoption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAdoptionStatus = async (req, res) => {
  try {
    const { appId } = req.params; // adoption request id
    const { status } = req.body; // pending / approved / rejected

    const adoption = await Adoption.findByIdAndUpdate(
      appId,
      { status },
      { new: true }
    ).populate('pet').populate('user', '-password');

    if (!adoption) return res.status(404).json({ message: 'Adoption application not found' });

    res.json({ message: 'Adoption status updated', adoption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAdoptionHistory = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ user: req.user._id })
      .populate('pet')
      .populate('user', '-password')
      .sort({ createdAt: -1 });

    res.json({ message: 'Adoption history fetched', adoptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPetAdoptions = async (req, res) => {
  try {
    const { id } = req.params; // petId
    const adoptions = await Adoption.find({ pet: id })
      .populate('user', '-password');

    res.json({ message: 'Adoption applications fetched', adoptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  applyAdoption,
  getAdoptionStatus,
  updateAdoptionStatus,
  getAdoptionHistory,
  getPetAdoptions,
};
