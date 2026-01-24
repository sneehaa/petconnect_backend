const express = require("express");
const dotenv = require("dotenv");
const rabbitmq = require("./utils/rabbitMQ");
const { setupEventListeners } = require("./events/notification.events");
const connectDB = require("./database/db");

const app = express();
dotenv.config();
connectDB();

app.use(express.json());
app.use("/api/notifications", require("./routes/notification.routes"));

rabbitmq
  .connect()
  .then(() => {
    setupEventListeners();
    console.log("Notification Service Listeners Active");
  })
  .catch((err) => console.error(err));

app.listen(process.env.PORT, () => console.log("Notification Service Running"));
