const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const rabbitmq = require("./utils/rabbitMQ");
const { setupEventListeners } = require("./events/pets.events");

const app = express();
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CORS setup
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Connect to database
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/pets/compatibility", require("./routes/compatibility.routes"));
app.use("/api/pets", require("./routes/pet.routes"));

// RabbitMQ setup
rabbitmq
  .connect()
  .then(() => {
    setupEventListeners();
  })
  .catch((err) => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app (for testing or other uses)
module.exports = app;
