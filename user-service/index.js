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

// mongodb connection
connectDB();

// Accepting json data
app.use(express.json());

// Accepting multipart/form-data
app.use(express.urlencoded({ extended: true }));

// creating test route
app.get("/test", (req,res) => {
    res.status(200).send("Hello");
});

// creating user routes
app.use('/api/user', require('./routes/user.routes'));

// defining port with fallback
const PORT = process.env.PORT

// run the server
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
});

// exporting app
module.exports = app;
