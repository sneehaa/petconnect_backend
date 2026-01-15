const adoptionRepo = require("../repositories/adoption.repository");
const axios = require("axios");

class AdoptionService {
  async applyAdoption(userId, petId, data) {
    try {
      console.log("=== DEBUG: Applying adoption ===");
      console.log("User ID:", userId);
      console.log("Pet ID:", petId);
      console.log("PET_SERVICE_URL:", process.env.PET_SERVICE_URL);

      const petUrl = `${process.env.PET_SERVICE_URL}/${petId}`;
      console.log("Calling pet service:", petUrl);

      // Fetch pet from pet service
      const petRes = await axios.get(petUrl);
      console.log("Pet response status:", petRes.status);
      console.log("Pet response data:", JSON.stringify(petRes.data, null, 2));

      // Check response structure
      if (!petRes.data.success) {
        throw new Error(
          `Pet service error: ${petRes.data.message || "Unknown error"}`
        );
      }

      if (!petRes.data.pet) {
        throw new Error("Pet data not found in response");
      }

      const pet = petRes.data.pet;
      console.log("Found pet:", pet.name, "Business ID:", pet.businessId);

      // Check if already applied
      const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
      if (existing) {
        console.log("Already applied for this pet");
        throw new Error("Already applied for this pet");
      }

      // Create adoption record
      const adoptionData = {
        petId,
        userId,
        businessId: pet.businessId,
        status: "pending",
        message: data.message || "",
      };

      console.log("Creating adoption with:", adoptionData);

      const adoption = await adoptionRepo.create(adoptionData);
      console.log("Adoption created successfully:", adoption._id);

      return adoption;
    } catch (error) {
      console.error("=== ERROR: Apply adoption failed ===");

      if (error.response) {
        // Axios error with response
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);

        if (error.response.status === 404) {
          throw new Error(`Pet with ID ${petId} not found`);
        }
      } else if (error.request) {
        // Request made but no response
        console.error("No response received:", error.request);
        throw new Error("Pet service is unavailable");
      } else {
        // Other errors
        console.error("Error message:", error.message);
      }

      throw new Error(`Failed to apply: ${error.message}`);
    }
  }

  async getAdoptionStatus(userId, petId) {
    try {
      const adoption = await adoptionRepo.findUserPetAdoption(userId, petId);
      if (!adoption) throw new Error("No adoption found");
      return adoption;
    } catch (error) {
      console.error("Get adoption status error:", error.message);
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  async getAdoptionHistory(userId) {
    try {
      return await adoptionRepo.findByUser(userId);
    } catch (error) {
      console.error("Get adoption history error:", error.message);
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  async getPetAdoptions(petId) {
    try {
      return await adoptionRepo.findByPet(petId);
    } catch (error) {
      console.error("Get pet adoptions error:", error.message);
      throw new Error(`Failed to get pet adoptions: ${error.message}`);
    }
  }

  async getAdoptionById(adoptionId) {
    try {
      console.log("Getting adoption by ID from repo:", adoptionId);
      const adoption = await adoptionRepo.findById(adoptionId);
      if (!adoption) throw new Error("Adoption not found");
      return adoption;
    } catch (error) {
      console.error("Get adoption by ID error:", error.message);
      throw new Error(`Failed to get adoption: ${error.message}`);
    }
  }

  async getBusinessAdoptions(businessId) {
    try {
      return await adoptionRepo.findByBusiness(businessId);
    } catch (error) {
      console.error("Get business adoptions error:", error.message);
      throw new Error(`Failed to get business adoptions: ${error.message}`);
    }
  }

  async approveAdoption(adoptionId, businessId) {
    try {
      const adoption = await adoptionRepo.findById(adoptionId);
      if (!adoption) throw new Error("Adoption not found");

      // BUSINESS LOGIC VALIDATION
      if (adoption.businessId !== businessId) {
        throw new Error("Unauthorized - Not your business");
      }

      adoption.status = "payment_pending";
      await adoption.save();

      // Get user email from user-service
      try {
        const userRes = await axios.get(
          `${process.env.USER_SERVICE_URL}/profile/${adoption.userId}`
        );

        // Send notification via notification service
        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/email`,
          {
            to: userRes.data.user.email,
            subject: "Adoption Approved!",
            text: `Your adoption request has been approved. Please proceed to payment.`,
          }
        );
      } catch (err) {
        console.error("Failed to send notification:", err.message);
      }

      return adoption;
    } catch (error) {
      console.error("Approve adoption error:", error.message);
      throw new Error(`Failed to approve: ${error.message}`);
    }
  }

  async rejectAdoption(adoptionId, businessId, reason) {
    try {
      const adoption = await adoptionRepo.findById(adoptionId);
      if (!adoption) throw new Error("Adoption not found");

      // BUSINESS LOGIC VALIDATION
      if (adoption.businessId !== businessId) {
        throw new Error("Unauthorized - Not your business");
      }

      adoption.status = "rejected";
      adoption.rejectionReason = reason;
      await adoption.save();

      // Get user email from user-service
      try {
        const userRes = await axios.get(
          `${process.env.USER_SERVICE_URL}/profile/${adoption.userId}`
        );

        // Send notification via notification service
        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/email`,
          {
            to: userRes.data.user.email,
            subject: "Adoption Request Rejected",
            text: `Your adoption request was rejected. Reason: ${reason}`,
          }
        );
      } catch (err) {
        console.error("Failed to send notification:", err.message);
      }

      return adoption;
    } catch (error) {
      console.error("Reject adoption error:", error.message);
      throw new Error(`Failed to reject: ${error.message}`);
    }
  }

  async updateAdoptionStatus(adoptionId, status) {
    try {
      const adoption = await adoptionRepo.updateStatus(adoptionId, status);
      if (!adoption) throw new Error("Adoption not found");
      return adoption;
    } catch (error) {
      console.error("Update status error:", error.message);
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }

  async markAdoptionPaid(adoptionId, userId, paymentId) {
    try {
      const adoption = await adoptionRepo.findById(adoptionId);
      if (!adoption) throw new Error("Adoption not found");

      // BUSINESS LOGIC VALIDATION
      if (adoption.userId !== userId) {
        throw new Error("Unauthorized - Not your adoption");
      }

      adoption.status = "completed";
      adoption.payment = {
        paymentId: paymentId,
        isPaid: true,
        paidAt: new Date(),
      };

      await adoption.save();

      // Notify business about payment
      try {
        const businessRes = await axios.get(
          `${process.env.BUSINESS_SERVICE_URL}/business/${adoption.businessId}`
        );

        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/email`,
          {
            to: businessRes.data.business.email,
            subject: "Payment Received",
            text: `Payment received for adoption ${adoptionId}`,
          }
        );
      } catch (err) {
        console.error("Failed to send business notification:", err.message);
      }

      return adoption;
    } catch (error) {
      console.error("Mark adoption paid error:", error.message);
      throw new Error(`Failed to mark paid: ${error.message}`);
    }
  }
}

module.exports = new AdoptionService();
