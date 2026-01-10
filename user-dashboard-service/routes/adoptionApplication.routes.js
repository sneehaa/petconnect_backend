const router = require('express').Router();
const {
  getMyApplications,
  createAdoptionApplication,
  approveAdoption,
  rejectAdoption // ✅ import rejectAdoption from controller
} = require('../controllers/adoptionApplication.controller');

// GET all applications of a user
router.get('/:userId', getMyApplications);

// POST a new adoption application
router.post('/', createAdoptionApplication);

// PUT to approve an adoption (business call)
router.put('/approve/:applicationId', approveAdoption);

// PUT to reject an adoption (business call)
router.put('/reject/:applicationId', rejectAdoption);

module.exports = router;
