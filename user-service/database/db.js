// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI; // <-- must match .env exactly
    if (!uri) {
        console.error("❌ Database connection error: MongoDB URI is not defined. Please check your .env file.");
        process.exit(1); // stop the app
    }

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Database connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
