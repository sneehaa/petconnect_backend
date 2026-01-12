const axios = require("axios");


const hasValidKhaltiKey = () => {
  const key = process.env.KHALTI_SECRET_KEY;
return key && (key.startsWith("live_") || key.startsWith("test_secret_key_"));
};

const initiateKhalti = async (payload) => {
  // Use mock if no valid key
  if (!hasValidKhaltiKey()) {
    console.log("🔧 MOCK MODE: Creating Khalti payment");
    
    // Generate a mock pidx
    const mockPidx = `mock_pidx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      pidx: mockPidx,
      payment_url: `http://localhost:3000/mock-payment/${mockPidx}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      expires_in: 1800,
      status: "Pending"
    };
  }

  // Real Khalti API call
  try {
    const response = await axios.post(
      process.env.KHALTI_INIT_URL,
      payload,
      {
        headers: { 
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` 
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Khalti initiation error:", error.response?.data || error.message);
    throw new Error("Payment initiation failed");
  }
};

const verifyKhalti = async (pidx) => {
  // If it's a mock pidx, return success
  if (pidx.startsWith("mock_pidx_")) {
    console.log("🔧 MOCK MODE: Verifying Khalti payment");
    
    // Simulate 2-second delay like real API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      pidx: pidx,
      status: "Completed",
      transaction_id: `mock_txn_${Date.now()}`,
      total_amount: 1000,
      fee: 30,
      refunded: false,
      created_at: new Date().toISOString()
    };
  }

  // Real Khalti verification
  try {
    const response = await axios.post(
      process.env.KHALTI_VERIFY_URL,
      { pidx },
      {
        headers: { 
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` 
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Khalti verification error:", error.response?.data || error.message);
    throw new Error("Payment verification failed");
  }
};

module.exports = {
  initiateKhalti,
  verifyKhalti
};