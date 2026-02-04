// Load environment variables for all tests
require('dotenv').config({ path: '.env.test' });

// Log loaded environment variables
console.log('\n📋 Loaded Environment Variables:');
console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);
console.log('PET_SERVICE_URL:', process.env.PET_SERVICE_URL);
console.log('ADOPTION_SERVICE_URL:', process.env.ADOPTION_SERVICE_URL);
console.log('PAYMENT_SERVICE_URL:', process.env.PAYMENT_SERVICE_URL);
console.log('');
