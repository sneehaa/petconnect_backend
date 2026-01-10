const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

client.on('connect', () => console.log('Redis client connecting...'));
client.on('ready', () => console.log('Redis is ready!'));
client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Could not connect to Redis:', err);
  }
})();

module.exports = client;
