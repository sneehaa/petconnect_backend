const request = require('supertest');
require('dotenv').config();

// Common endpoints to try for REST APIs
const COMMON_ENDPOINTS = [
  '/',
  '/health',
  '/status',
  '/api',
  '/api/health',
  '/users',
  '/pets',
  '/adoptions',
  '/payments',
  '/notifications'
];

async function tryEndpoint(url, method = 'GET', data = null) {
  try {
    let response;
    switch (method) {
      case 'GET':
        response = await request(url).get('').timeout(3000);
        break;
      case 'POST':
        response = await request(url).post('').send(data || {}).timeout(3000);
        break;
    }
    
    return {
      success: true,
      status: response.status,
      body: response.body || {}
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

describe('Service Discovery', () => {
  const services = [
    { name: 'User Service', baseUrl: process.env.USER_SERVICE_URL },
    { name: 'Pet Service', baseUrl: process.env.PET_SERVICE_URL },
    { name: 'Adoption Service', baseUrl: process.env.ADOPTION_SERVICE_URL },
    { name: 'Payment Service', baseUrl: process.env.PAYMENT_SERVICE_URL },
    { name: 'Notification Service', baseUrl: process.env.NOTIFICATION_SERVICE_URL }
  ];

  services.forEach(service => {
    test(`Discover ${service.name} endpoints`, async () => {
      console.log(`\n🔍 Discovering ${service.name} (${service.baseUrl})`);
      
      if (!service.baseUrl) {
        console.log('⚠️  No URL configured');
        return;
      }

      let foundEndpoints = 0;
      
      for (const endpoint of COMMON_ENDPOINTS) {
        const fullUrl = service.baseUrl + endpoint;
        
        try {
          const response = await request(fullUrl)
            .get('')
            .timeout(2000);
          
          if (response.status < 400) {
            console.log(`  ✅ ${endpoint.padEnd(20)} -> ${response.status}`);
            foundEndpoints++;
          }
        } catch (error) {
          // Endpoint not found or timeout
        }
      }
      
      console.log(`  Found ${foundEndpoints} endpoints`);
      
      // This test always passes - it's just for discovery
      expect(true).toBe(true);
    });
  });
});
