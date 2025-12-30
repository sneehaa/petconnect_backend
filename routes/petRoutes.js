const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { protect } = require('../middleware/auth'); 

// Pet routes
router.get('/shelter/:shelterId', petController.getPetsByShelter);
router.get('/:id', protect, petController.getPetDetail);
router.get('/:id/contact', protect, petController.getShelterContact);
router.post('/', protect, petController.createPet);
router.put('/:id', protect, petController.updatePet);
router.delete('/:id', protect, petController.deletePet);

// Adoption routes
router.post('/:id/adopt', protect, petController.applyAdoption);
router.get('/:id/adoption', protect, petController.getAdoptionStatus);
router.put('/adoptions/:appId', protect, petController.updateAdoptionStatus);
router.get('/:id/adoptions', protect, petController.getPetAdoptions);

module.exports = router;
