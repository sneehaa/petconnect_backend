require("dotenv").config();
const express = require("express");
const connectDB = require("./database/db");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const rabbitmq = require("./utils/rabbitMQ");

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/test", (req, res) => {
  res.status(200).send("Business Service Online");
});

app.use("/api/business", require("./routes/business.routes"));

rabbitmq
  .connect()
  .then(() => {
    console.log("Business Service connected to RabbitMQ");

    const PORT = process.env.PORT || 5501;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Business Service failed to connect to RabbitMQ:", err);
    process.exit(1);
  });

module.exports = app;
