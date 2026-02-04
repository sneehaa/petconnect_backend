// Simple helper functions for integration tests

async function waitForService(url, timeout = 10000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Service not ready yet
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(`Service at ${url} not ready after ${timeout}ms`);
}

function logTestStep(step) {
  console.log(`📝 ${step}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

module.exports = {
  waitForService,
  logTestStep,
  logSuccess,
  logWarning
};
