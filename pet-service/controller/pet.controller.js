const petService = require("../services/pet.service");

// Create Pet
exports.createPet = async (req, res) => {
  try {
    const petData = { ...req.body };
    if (req.files) petData.photos = req.files.map(f => `/uploads/pets/${f.filename}`);

    const pet = await petService.createPet(req.user._id, petData);
    res.status(201).json({ success: true, pet });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get Pet by ID
exports.getPetDetail = async (req, res) => {
  try {
    const pet = await petService.getPetById(req.params.id);
    res.json({ success: true, pet });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

// Get Pets by Business
exports.getPetsByBusiness = async (req, res) => {
  try {
    const pets = await petService.getPetsByBusiness(req.params.businessId);
    res.json({ success: true, pets });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Update Pet
exports.updatePet = async (req, res) => {
  try {
    const pet = await petService.updatePet(req.params.id, req.body);
    res.json({ success: true, pet });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Delete Pet
exports.deletePet = async (req, res) => {
  try {
    await petService.deletePet(req.params.id);
    res.json({ success: true, message: "Pet deleted" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get All Pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await petService.getAllPets();
    res.json({ success: true, pets });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
