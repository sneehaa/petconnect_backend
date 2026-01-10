// database/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URL_USER_DASHBOARD; // Use the correct env variable
    if (!dbUri) {
      throw new Error("MongoDB URI is not defined. Please check your .env file.");
    }
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Database");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit app if DB connection fails
  }
};

module.exports = connectDB;
