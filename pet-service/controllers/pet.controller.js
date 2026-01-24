const petService = require("../services/pet.service");

// Get all pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await petService.getAllPets();
    res.json({ success: true, pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pets by business
exports.getPetsByBusiness = async (req, res) => {
  try {
    const pets = await petService.getPetsByBusiness(req.params.businessId);
    res.json({ success: true, pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pet by ID
exports.getPetDetail = async (req, res) => {
  try {
    const pet = await petService.getPetById(req.params.id);
    res.json({ success: true, pet });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.createPet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      businessId: req.user.id,
      photos: req.files?.map((file) => file.path) || [],
    };
    const pet = await petService.createPetDirect(petData);
    res.status(201).json({ success: true, pet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.updatePet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      photos: req.files?.map((file) => file.path),
    };
    const pet = await petService.updatePetDirect(req.params.id, petData);
    res.json({ success: true, pet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.deletePet = async (req, res) => {
  try {
    await petService.deletePetDirect(req.params.id);
    res.json({ success: true, message: "Pet deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
