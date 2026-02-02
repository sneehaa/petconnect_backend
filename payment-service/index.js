// importing
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const rabbitmq = require("./utils/rabbitmq");
const { setupEventListeners } = require("./events/payment.events");

// dotenv config
dotenv.config();

// Making express app
const app = express();

// cors config to accept request from frontend
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));


//testing

// mongodb connection
connectDB();

// Accepting json data
app.use(express.json());

// Accepting multipart/form-data
app.use(express.urlencoded({ extended: true }));

// creating test route
app.get("/test", (req, res) => {
  res.status(200).send("Hello");
});

// creating user routes
app.use("/api/payments", require("./routes/payment.routes"));

rabbitmq
  .connect()
  .then(() => setupEventListeners())
  .catch((err) => console.error("Failed to connect to RabbitMQ:", err));

// defining port with fallback
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));

// exporting app
module.exports = app;
