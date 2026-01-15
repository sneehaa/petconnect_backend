const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/admin.middleware");
const businessController = require("../controllers/businesses.controller");

// PUT approve/reject
router.put('/:id/approve', adminMiddleware, businessController.approveBusiness);
router.put('/:id/reject', adminMiddleware, businessController.rejectBusiness);

// PUT verify documents
router.put('/:id/verify-docs', adminMiddleware, businessController.verifyDocuments);
module.exports = router;
