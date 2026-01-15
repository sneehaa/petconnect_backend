// -------------------- Imports --------------------
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db'); // CommonJS
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// Import routes (CommonJS)
const businessRoutes = require('./routes/business.routes');
const countRoutes = require('./routes/count.routes');

// -------------------- Config --------------------
dotenv.config();

// -------------------- Express App --------------------
const app = express();

// -------------------- Cloudinary Config --------------------
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// -------------------- CORS Config --------------------
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// -------------------- MongoDB Connection --------------------
connectDB();

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Test Route --------------------
app.get("/test", (req, res) => {
    res.status(200).send("Hello");
});

// -------------------- Routes --------------------
app.use('/api/business', businessRoutes);
app.use('/api/business', countRoutes); // GET /api/business/admin/count

// -------------------- Port --------------------
const PORT = process.env.PORT || 5520;

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`Business service running on port ${PORT}`);
});

// -------------------- Export App --------------------
module.exports = app;
