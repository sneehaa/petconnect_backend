
// Receipt number generator
const generateReceiptNo = () => {
  return "RCPT-" + Date.now();
};

// Export all functions
module.exports = {
  generateReceiptNo,
};
