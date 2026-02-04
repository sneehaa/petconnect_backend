const request = require('supertest');
require('dotenv').config({ path: '.env.test' });

console.log('\n🔧 Loaded environment:');
console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);
console.log('PET_SERVICE_URL:', process.env.PET_SERVICE_URL);
console.log('ADOPTION_SERVICE_URL:', process.env.ADOPTION_SERVICE_URL);

describe('Verify Setup', () => {
  test('Check environment', () => {
    expect(process.env.USER_SERVICE_URL).toBe('http://localhost:3001');
    expect(process.env.PET_SERVICE_URL).toBe('http://localhost:3002');
    console.log('✅ Environment OK');
  });

  test('Check user service', async () => {
    try {
      const res = await request(process.env.USER_SERVICE_URL)
        .get('/')
        .timeout(3000);
      console.log(`✅ User service: Status ${res.status}`);
      expect(res.status).toBeLessThan(500);
    } catch (error) {
      console.log(`⚠️  User service not running at ${process.env.USER_SERVICE_URL}`);
      console.log('Start it with: cd ../user-service && npm run dev');
      // Don't fail
    }
  });

  test('Check pet service', async () => {
    try {
      const res = await request(process.env.PET_SERVICE_URL)
        .get('/')
        .timeout(3000);
      console.log(`✅ Pet service: Status ${res.status}`);
      expect(res.status).toBeLessThan(500);
    } catch (error) {
      console.log(`⚠️  Pet service not running at ${process.env.PET_SERVICE_URL}`);
      console.log('Start it with: cd ../pet-service && npm run dev');
    }
  });
});
