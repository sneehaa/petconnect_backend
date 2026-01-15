// services/khalti.service.js

// Simple in-memory store
const mockPayments = new Map();

const initiateKhalti = async (payload) => {
  console.log("🎓 Creating mock payment for college project");
  
  const mockPidx = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store for verification
  mockPayments.set(mockPidx, {
    ...payload,
    created_at: new Date().toISOString()
  });
  
  // Return simplified response for Flutter
  return {
    pidx: mockPidx,
    status: "Pending",
    amount: payload.amount,
    message: "Mock payment ready for verification"
  };
};

const verifyKhalti = async (pidx) => {
  console.log("🎓 Verifying mock payment");
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const payment = mockPayments.get(pidx);
  if (!payment) {
    throw new Error("Payment not found");
  }
  
  return {
    pidx: pidx,
    status: "Completed",
    transaction_id: `txn_${Date.now()}`,
    amount: payment.amount,
    created_at: payment.created_at,
    message: "✅ Mock payment successful"
  };
};

module.exports = {
  initiateKhalti,
  verifyKhalti
};