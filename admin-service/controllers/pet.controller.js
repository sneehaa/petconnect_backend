const Pet = require("../database/models/Pet");
const logger = require("../utils/logger");
const response = require("../utils/response");

// Get all pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    return response.success(res, { pets });
  } catch (err) {
    logger.error("Get pets error:", err);
    return response.error(res, "Failed to fetch pets");
  }
};

// Remove inappropriate pet
exports.removePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.petId);
    if (!pet) return response.error(res, "Pet not found");
    return response.success(res, { message: "Pet removed successfully" });
  } catch (err) {
    logger.error("Remove pet error:", err);
    return response.error(res, "Failed to remove pet");
  }
};
