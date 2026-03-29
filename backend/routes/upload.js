const express = require('express');
const router = express.Router();
const { uploadController, upload } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');
const { requireAdminOrTrader, requireApprovedTrader } = require('../middleware/rbac');

// Upload single image - requires authentication
router.post('/single', 
  authMiddleware, 
  requireAdminOrTrader, 
  requireApprovedTrader,
  upload.single('image'), 
  uploadController.uploadSingle
);

// Upload multiple images - requires authentication
router.post('/multiple', 
  authMiddleware, 
  requireAdminOrTrader, 
  requireApprovedTrader,
  upload.array('images', 10), // Max 10 images
  uploadController.uploadMultiple
);

// Delete image - requires authentication
router.delete('/:filename', 
  authMiddleware, 
  requireAdminOrTrader, 
  requireApprovedTrader,
  uploadController.deleteImage
);

module.exports = router;
