const petService = require("../services/pet.service");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// pet.controller.js
exports.createPet = async (req, res) => {
  try {
    const petData = { ...req.body };
    
    // Handle existing photos (URLs from pet.photos)
    let existingPhotos = [];
    if (req.body.existingPhotos) {
      existingPhotos = Array.isArray(req.body.existingPhotos) 
        ? req.body.existingPhotos 
        : [req.body.existingPhotos];
    }

    // Handle new file uploads
    let newPhotoUrls = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map(file =>
          cloudinary.uploader.upload(file.path, {
            folder: "pets",
            crop: "scale"
          })
        )
      );
      newPhotoUrls = uploads.map(img => img.secure_url);
      
      // Clean up temp files
      req.files.forEach(file => fs.unlinkSync(file.path));
    }

    // Combine existing and new photos
    petData.photos = [...existingPhotos, ...newPhotoUrls];

    const pet = await petService.createPet(req.user.id, petData);
    res.status(201).json({
      success: true,
      pet
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const petData = { ...req.body };
    
    // Handle existing photos
    let existingPhotos = [];
    if (req.body.existingPhotos) {
      existingPhotos = Array.isArray(req.body.existingPhotos) 
        ? req.body.existingPhotos 
        : [req.body.existingPhotos];
    }

    // Handle new uploads
    let newPhotoUrls = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map(file =>
          cloudinary.uploader.upload(file.path, {
            folder: "pets",
            crop: "scale"
          })
        )
      );
      newPhotoUrls = uploads.map(img => img.secure_url);
      req.files.forEach(file => fs.unlinkSync(file.path));
    }

    // Combine photos
    petData.photos = [...existingPhotos, ...newPhotoUrls];

    const pet = await petService.updatePet(req.params.id, petData);
    res.json({ success: true, pet });
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
