const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directories
const uploadsDir = path.join(__dirname, "../uploads");
const tempDir = path.join(__dirname, "../uploads/temp");

[uploadsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// For registration - simpler storage
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"));
  }
};

const docsFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Document file type not allowed. Allowed: jpeg, jpg, png, pdf, doc, docx, xls, xlsx"));
  }
};

// For profile image uploads (allow no file for registration)
const uploadBusinessProfileImage = multer({
  storage: tempStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// For document uploads
const uploadBusinessDoc = multer({
  storage: tempStorage,
  fileFilter: docsFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = {
  uploadBusinessDoc,
  uploadBusinessProfileImage,
};