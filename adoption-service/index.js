const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const rabbitmq = require("./utils/rabbitMQ");
const { setupAdoptionListeners } = require("./events/adoption.events");

const app = express();
dotenv.config();

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/adoption", require("./routes/adoption.routes"));

rabbitmq
  .connect()
  .then(() => {
    setupAdoptionListeners();
    console.log("RabbitMQ Connected & Listeners Active");
  })
  .catch((err) => console.error("RabbitMQ Connection Failed", err));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Adoption Service running on port ${PORT}`);
});

module.exports = app;
