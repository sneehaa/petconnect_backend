// Load environment from .env.test with absolute path
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.test') });

const request = require('supertest');

describe('PetConnect - Basic Integration Tests', () => {
  // Test 1: Basic connectivity
  test('Should pass a basic test', () => {
    console.log('✅ Basic test running...');
    console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);
    console.log('PET_SERVICE_URL:', process.env.PET_SERVICE_URL);
    expect(true).toBe(true);
  });

  // Test 2: Check environment setup
  test('Environment should be configured', () => {
    console.log('\n📋 Checking environment variables:');
    console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);
    console.log('PET_SERVICE_URL:', process.env.PET_SERVICE_URL);
    
    expect(process.env.USER_SERVICE_URL).toBeDefined();
    expect(process.env.PET_SERVICE_URL).toBeDefined();
    console.log('✅ Environment variables loaded');
  });
});
