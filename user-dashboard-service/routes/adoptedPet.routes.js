const router = require('express').Router();
const { getMyAdoptedPets } = require('../controllers/adoptedPet.controller');

router.get('/:userId', getMyAdoptedPets);

module.exports = router;
