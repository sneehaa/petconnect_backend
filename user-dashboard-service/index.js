// index.js (User Dashboard Service)

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database/db'); // Make sure this path is correct

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// -----------------------
// Routes
// -----------------------
app.use('/api/adopted-pets', require('./routes/adoptedPet.routes'));
app.use('/api/adoption-applications', require('./routes/adoptionApplication.routes'));
app.use('/api/payment-history', require('./routes/paymentHistory.routes'));
app.use('/api/profile', require('./routes/profile.routes'));

// Test route to confirm service is running
app.get('/test', (req, res) => {
    res.status(200).send('User Dashboard Service running');
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5600;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
