// Find what ports your services are actually running on
const net = require('net');

// Common ports to check
const commonPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 4000, 4001, 4002, 4003, 4004, 4005];

function checkPort(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    
    client.setTimeout(1000);
    
    client.on('connect', () => {
      client.destroy();
      resolve({ port, open: true });
    });
    
    client.on('timeout', () => {
      client.destroy();
      resolve({ port, open: false });
    });
    
    client.on('error', () => {
      client.destroy();
      resolve({ port, open: false });
    });
    
    client.connect(port, 'localhost');
  });
}

describe('Discover Service Ports', () => {
  test('Find open ports for services', async () => {
    console.log('\n🔍 Scanning for open ports...');
    
    const results = [];
    
    for (const port of commonPorts) {
      const result = await checkPort(port);
      if (result.open) {
        console.log(`✅ Port ${port} is OPEN - might be a service`);
        results.push(port);
      }
    }
    
    console.log('\n📊 Found open ports:', results);
    
    if (results.length > 0) {
      console.log('\n💡 Update your .env.test file with these ports:');
      console.log('USER_SERVICE_URL=http://localhost:' + results[0]);
      if (results[1]) console.log('PET_SERVICE_URL=http://localhost:' + results[1]);
      if (results[2]) console.log('ADOPTION_SERVICE_URL=http://localhost:' + results[2]);
      if (results[3]) console.log('PAYMENT_SERVICE_URL=http://localhost:' + results[3]);
    } else {
      console.log('\n⚠️  No services found. Make sure services are running!');
      console.log('Run: cd ../user-service && npm run dev');
      console.log('Run: cd ../pet-service && npm run dev');
      console.log('Run: cd ../adoption-service && npm run dev');
    }
    
    // Don't fail the test - it's just for discovery
    expect(results.length).toBeGreaterThanOrEqual(0);
  }, 15000); // Longer timeout for port scanning
});
