const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../image');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

const uploadController = {
  // Upload single image
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Create URL path for the uploaded image
      const imageUrl = `/image/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Upload single error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image'
      });
    }
  },

  // Upload multiple images
  async uploadMultiple(req, res) {
    try {
      console.log('Upload multiple called');
      console.log('req.files:', req.files);
      console.log('uploadDir:', uploadDir);
      console.log('req.body:', req.body);
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
      }

      // Create URL paths for all uploaded images
      const imageUrls = req.files.map(file => `/image/${file.filename}`);
      console.log('imageUrls:', imageUrls);
      console.log('Files saved to:', req.files.map(f => f.path));

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        imageUrls: imageUrls,
        filenames: req.files.map(file => file.filename)
      });
    } catch (error) {
      console.error('Upload multiple error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading images'
      });
    }
  },

  // Delete image
  async deleteImage(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting image'
      });
    }
  }
};

module.exports = { uploadController, upload };
