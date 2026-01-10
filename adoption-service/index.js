// importing
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// dotenv config
dotenv.config();

// Making express app
const app = express();

// cloudinary config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// cors config to accept request from frontend
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// Accepting json data
app.use(express.json());

// Accepting multipart/form-data
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
connectDB(mongoUri);

// creating test route
app.get("/test", (req, res) => {
    res.status(200).send("Hello from Adoption Service!");
});

// creating adoption routes
app.use('/api/adoption', require('./routes/adoption.routes'));

// defining port
const PORT = process.env.PORT_ADOPTION || 5503;

// run the server
app.listen(PORT, () => {
    console.log(`Adoption Service is running on port ${PORT}`);
});

// exporting app
module.exports = app;
