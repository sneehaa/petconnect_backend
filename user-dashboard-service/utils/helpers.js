const crypto = require('crypto');

// Generate a random string (for OTP, tokens, etc.)
const generateRandomString = (length = 6) => {
    return crypto.randomBytes(length).toString('hex');
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Capitalize first letter of a string
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Simple email validator
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

module.exports = {
    generateRandomString,
    formatDate,
    capitalize,
    isValidEmail
};
