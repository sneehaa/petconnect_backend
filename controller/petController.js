const Pet = require('../model/petModel');
const Adoption = require('../model/adoptionModel');
const User = require('../model/userModel');

const getPetsByShelter = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const pets = await Pet.find({ shelterId });
    res.json({ message: 'Pets fetched', pets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPetDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id).lean();
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const shelter = await User.findById(pet.shelterId).select('name email phone');

    let adoptionStatus = null;
    if (req.user) {
      const adoption = await Adoption.findOne({ pet: id, user: req.user._id });
      if (adoption) adoptionStatus = adoption.status;
    }

    res.json({
      message: 'Pet fetched',
      pet: {
        ...pet,
        shelter,
        adoptionStatus
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createPet = async (req, res) => {
  try {
    const petData = req.body;
    petData.shelterId = req.user._id;
    if (req.files) {
      petData.photos = req.files.map(file => file.path);
      if (req.files.videos) petData.videos = req.files.videos.map(file => file.path);
    }

    const pet = await Pet.create(petData);
    res.status(201).json({ message: 'Pet created', pet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (req.files) {
      updateData.photos = req.files.map(file => file.path);
      if (req.files.videos) updateData.videos = req.files.videos.map(file => file.path);
    }

    const pet = await Pet.findByIdAndUpdate(id, updateData, { new: true });
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet updated', pet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findByIdAndDelete(id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const applyAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    const adoptionData = {
      pet: id,
      user: req.user._id,
      status: 'Pending',
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
    const { id } = req.params;
    const adoption = await Adoption.findOne({ pet: id, user: req.user._id });
    if (!adoption) return res.status(404).json({ message: 'No adoption application found' });
    res.json({ message: 'Adoption status fetched', adoption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAdoptionStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body;
    const adoption = await Adoption.findByIdAndUpdate(appId, { status }, { new: true });
    if (!adoption) return res.status(404).json({ message: 'Adoption application not found' });
    res.json({ message: 'Adoption status updated', adoption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPetAdoptions = async (req, res) => {
  try {
    const { id } = req.params;
    const adoptions = await Adoption.find({ pet: id });
    res.json({ message: 'Adoption applications fetched', adoptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getShelterContact = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const shelter = await User.findById(pet.shelterId).select('name email phone');
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    res.json({ message: 'Shelter contact fetched', shelter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getPetsByShelter,
  getPetDetail,
  createPet,
  updatePet,
  deletePet,
  applyAdoption,
  getAdoptionStatus,
  updateAdoptionStatus,
  getPetAdoptions,
  getShelterContact
};
