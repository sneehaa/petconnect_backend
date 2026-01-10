const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
    try {
        if (!mongoUri) {
            throw new Error('MongoDB URI is not defined. Please check your .env file.');
        }

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to Database');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1); // Stop the server if DB connection fails
    }
};

module.exports = connectDB;
