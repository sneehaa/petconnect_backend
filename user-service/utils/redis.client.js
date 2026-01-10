const redis = require('redis');

// Use the Docker service name 'redis' as host if REDIS_HOST is not set
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis', // changed from 'localhost' to 'redis'
    port: process.env.REDIS_PORT || 6379,
  },
});

client.on('connect', () => console.log('Redis client connecting...'));
client.on('ready', () => console.log('Redis is ready!'));
client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('end', () => console.log('Redis connection closed'));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Could not connect to Redis:', err);
  }
})();

module.exports = client;
