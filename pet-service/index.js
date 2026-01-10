// index.js (or app.js)

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config();

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env. Please check your environment variables.');
    process.exit(1);
}

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

const app = express();

// Cloudinary config
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️ Cloudinary env variables are missing. Image uploads may fail.');
} else {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// CORS
app.use(cors({ origin: true, credentials: true }));

// Parse JSON & form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/pets', require('./routes/pet.routes'));

// Test route
app.get("/test", (req,res) => res.status(200).send("Hello"));

// Start server
const PORT = process.env.PORT || 5502;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
