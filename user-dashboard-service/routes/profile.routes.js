const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');

router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);

module.exports = router;
