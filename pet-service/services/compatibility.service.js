const compatibilityRepo = require("../repositories/compatibility.repository");
const petRepo = require("../repositories/pet.repository");

// Personality trait keyword mappings
const ENERGY_KEYWORDS = {
  high: ["energetic", "active", "playful", "hyper", "bouncy", "lively", "spirited", "athletic", "vigorous"],
  moderate: ["moderate", "balanced", "adaptable", "easygoing", "easy-going", "flexible", "versatile"],
  low: ["calm", "lazy", "relaxed", "chill", "quiet", "gentle", "mellow", "laid-back", "laidback", "docile", "serene"],
};

const SOCIAL_KEYWORDS = {
  high: ["friendly", "social", "affectionate", "loving", "cuddly", "loyal", "devoted", "clingy", "needy", "attached"],
  moderate: ["sociable", "companionable", "amiable", "pleasant", "good-natured"],
  low: ["independent", "aloof", "reserved", "solitary", "distant", "detached", "self-reliant"],
};

const TEMPERAMENT_KEYWORDS = {
  good_with_kids: ["gentle", "patient", "tolerant", "friendly", "good with kids", "family-friendly", "kid-friendly", "loving"],
  noisy: ["vocal", "barky", "loud", "noisy", "talkative", "howler"],
  quiet: ["quiet", "calm", "silent", "reserved", "mellow"],
  trained: ["trained", "obedient", "well-behaved", "disciplined", "well-mannered", "housebroken"],
  needs_training: ["stubborn", "untrained", "wild", "mischievous", "naughty", "challenging"],
};

class CompatibilityService {
  // Save or update user lifestyle questionnaire
  async saveQuestionnaire(userId, data) {
    data.userId = userId;
    return compatibilityRepo.update(userId, data);
  }

  // Get user's saved questionnaire
  async getQuestionnaire(userId) {
    const questionnaire = await compatibilityRepo.findByUserId(userId);
    if (!questionnaire) throw new Error("No questionnaire found. Please complete the lifestyle questionnaire first.");
    return questionnaire;
  }

  // Calculate compatibility with a specific pet
  async getCompatibilityWithPet(userId, petId) {
    const questionnaire = await compatibilityRepo.findByUserId(userId);
    if (!questionnaire) {
      throw new Error("No questionnaire found. Please complete the lifestyle questionnaire first.");
    }

    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");

    return this._calculateCompatibility(questionnaire, pet);
  }

  // Get compatibility scores for all available pets
  async getCompatibilityAll(userId) {
    const questionnaire = await compatibilityRepo.findByUserId(userId);
    if (!questionnaire) {
      throw new Error("No questionnaire found. Please complete the lifestyle questionnaire first.");
    }

    const pets = await petRepo.getAll();
    const availablePets = pets.filter((p) => p.available);

    const results = availablePets.map((pet) => {
      const result = this._calculateCompatibility(questionnaire, pet);
      return {
        pet: pet.toObject(),
        compatibilityScore: result.compatibilityScore,
        explanation: result.explanation,
        breakdown: result.breakdown,
      };
    });

    // Sort by compatibility score descending
    results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return results;
  }

  // ---- Core AI Compatibility Algorithm ----
  _calculateCompatibility(questionnaire, pet) {
    const personalityText = (pet.personality || "").toLowerCase();
    const breed = (pet.breed || "").toLowerCase();
    const age = pet.age || 1;

    // Extract traits from personality text
    const petTraits = this._extractTraits(personalityText);

    // Infer additional traits from age
    const ageTraits = this._inferAgeTraits(age);

    // Calculate individual scores
    const energyScore = this._scoreEnergy(questionnaire, petTraits, ageTraits);
    const spaceScore = this._scoreSpace(questionnaire, petTraits, ageTraits);
    const timeScore = this._scoreTime(questionnaire, petTraits);
    const experienceScore = this._scoreExperience(questionnaire, petTraits);
    const householdScore = this._scoreHousehold(questionnaire, petTraits);
    const noiseScore = this._scoreNoise(questionnaire, petTraits);

    // Weighted total
    const weights = {
      energy: 0.25,
      space: 0.20,
      time: 0.20,
      experience: 0.15,
      household: 0.10,
      noise: 0.10,
    };

    const totalScore = Math.round(
      energyScore.score * weights.energy +
      spaceScore.score * weights.space +
      timeScore.score * weights.time +
      experienceScore.score * weights.experience +
      householdScore.score * weights.household +
      noiseScore.score * weights.noise
    );

    // Generate explanation
    const explanation = this._generateExplanation(
      questionnaire,
      pet,
      totalScore,
      { energyScore, spaceScore, timeScore, experienceScore, householdScore, noiseScore }
    );

    return {
      compatibilityScore: totalScore,
      explanation,
      breakdown: {
        energy: { score: energyScore.score, weight: "25%", detail: energyScore.detail },
        space: { score: spaceScore.score, weight: "20%", detail: spaceScore.detail },
        time: { score: timeScore.score, weight: "20%", detail: timeScore.detail },
        experience: { score: experienceScore.score, weight: "15%", detail: experienceScore.detail },
        household: { score: householdScore.score, weight: "10%", detail: householdScore.detail },
        noise: { score: noiseScore.score, weight: "10%", detail: noiseScore.detail },
      },
    };
  }

  // Extract traits from personality text
  _extractTraits(text) {
    const traits = {
      energyLevel: "moderate",
      socialLevel: "moderate",
      goodWithKids: false,
      isNoisy: false,
      isQuiet: false,
      isTrained: false,
      needsTraining: false,
    };

    // Determine energy level
    const highEnergyCount = ENERGY_KEYWORDS.high.filter((k) => text.includes(k)).length;
    const lowEnergyCount = ENERGY_KEYWORDS.low.filter((k) => text.includes(k)).length;
    const modEnergyCount = ENERGY_KEYWORDS.moderate.filter((k) => text.includes(k)).length;

    if (highEnergyCount > lowEnergyCount && highEnergyCount > modEnergyCount) {
      traits.energyLevel = "high";
    } else if (lowEnergyCount > highEnergyCount && lowEnergyCount > modEnergyCount) {
      traits.energyLevel = "low";
    }

    // Determine social level
    const highSocialCount = SOCIAL_KEYWORDS.high.filter((k) => text.includes(k)).length;
    const lowSocialCount = SOCIAL_KEYWORDS.low.filter((k) => text.includes(k)).length;

    if (highSocialCount > lowSocialCount) {
      traits.socialLevel = "high";
    } else if (lowSocialCount > highSocialCount) {
      traits.socialLevel = "low";
    }

    // Check temperament traits
    traits.goodWithKids = TEMPERAMENT_KEYWORDS.good_with_kids.some((k) => text.includes(k));
    traits.isNoisy = TEMPERAMENT_KEYWORDS.noisy.some((k) => text.includes(k));
    traits.isQuiet = TEMPERAMENT_KEYWORDS.quiet.some((k) => text.includes(k));
    traits.isTrained = TEMPERAMENT_KEYWORDS.trained.some((k) => text.includes(k));
    traits.needsTraining = TEMPERAMENT_KEYWORDS.needs_training.some((k) => text.includes(k));

    return traits;
  }

  // Infer traits from pet age
  _inferAgeTraits(age) {
    if (age < 1) {
      return { energyModifier: "high", needsAttention: "high", trainability: "needs_training" };
    } else if (age <= 3) {
      return { energyModifier: "high", needsAttention: "moderate", trainability: "moderate" };
    } else if (age <= 7) {
      return { energyModifier: "moderate", needsAttention: "moderate", trainability: "trained" };
    } else {
      return { energyModifier: "low", needsAttention: "moderate", trainability: "trained" };
    }
  }

  // Score: Energy Match (pet energy vs user activity + preference)
  _scoreEnergy(questionnaire, petTraits, ageTraits) {
    const energyMap = { low: 1, moderate: 2, high: 3 };
    const activityMap = { sedentary: 1, moderate: 2, active: 3, very_active: 4 };
    const prefMap = { calm: 1, moderate: 2, energetic: 3 };

    // Combine personality energy with age-based energy
    let petEnergy = energyMap[petTraits.energyLevel] || 2;
    const ageEnergy = energyMap[ageTraits.energyModifier] || 2;
    petEnergy = (petEnergy + ageEnergy) / 2;

    const userActivity = activityMap[questionnaire.activityLevel] || 2;
    const userPref = prefMap[questionnaire.preferredEnergy] || 2;

    // Combine user's activity and preference
    const userEnergy = (userActivity * 0.6 + userPref * 0.4) * (3 / 4);

    const diff = Math.abs(petEnergy - userEnergy);
    let score;
    if (diff <= 0.5) score = 100;
    else if (diff <= 1) score = 80;
    else if (diff <= 1.5) score = 60;
    else if (diff <= 2) score = 40;
    else score = 20;

    const petEnergyLabel = petEnergy <= 1.5 ? "low" : petEnergy <= 2.5 ? "moderate" : "high";
    const detail = `Pet energy: ${petEnergyLabel}, Your preference: ${questionnaire.preferredEnergy}`;

    return { score, detail };
  }

  // Score: Space Compatibility
  _scoreSpace(questionnaire, petTraits, ageTraits) {
    const spaceMap = { apartment: 1, house_small: 2, house_large: 3, farm: 4 };
    const energyMap = { low: 1, moderate: 2, high: 3 };

    const userSpace = spaceMap[questionnaire.livingSpace] || 2;
    const petEnergy = energyMap[petTraits.energyLevel] || 2;
    const hasYard = questionnaire.hasYard;

    let score = 70; // base

    // High energy pets need more space
    if (petEnergy === 3 && userSpace === 1) {
      score = 30;
    } else if (petEnergy === 3 && userSpace === 2) {
      score = hasYard ? 70 : 50;
    } else if (petEnergy === 3 && userSpace >= 3) {
      score = 95;
    } else if (petEnergy <= 1 && userSpace === 1) {
      score = 95;
    } else if (petEnergy <= 1) {
      score = 90;
    } else if (petEnergy === 2) {
      score = userSpace >= 2 ? 85 : 65;
    }

    // Yard bonus for active pets
    if (hasYard && petEnergy >= 2) score = Math.min(score + 10, 100);

    const detail = `Living space: ${questionnaire.livingSpace.replace("_", " ")}, Yard: ${hasYard ? "yes" : "no"}`;
    return { score, detail };
  }

  // Score: Time Availability
  _scoreTime(questionnaire, petTraits) {
    const timeMap = { limited: 1, moderate: 2, extensive: 3 };
    const scheduleMap = { home_all_day: 3, part_time_away: 2, full_time_away: 1 };
    const socialMap = { low: 1, moderate: 2, high: 3 };

    const userTime = timeMap[questionnaire.timeForPet] || 2;
    const userSchedule = scheduleMap[questionnaire.workSchedule] || 2;
    const petSocial = socialMap[petTraits.socialLevel] || 2;

    const userAvailability = (userTime + userSchedule) / 2;
    const diff = petSocial - userAvailability;

    let score;
    if (diff <= 0) score = 95; // User has more time than pet needs
    else if (diff <= 0.5) score = 80;
    else if (diff <= 1) score = 60;
    else if (diff <= 1.5) score = 40;
    else score = 25;

    const detail = `Your schedule: ${questionnaire.workSchedule.replace(/_/g, " ")}, Time for pet: ${questionnaire.timeForPet}`;
    return { score, detail };
  }

  // Score: Experience Match
  _scoreExperience(questionnaire, petTraits) {
    const expMap = { first_time: 1, some_experience: 2, experienced: 3 };
    const userExp = expMap[questionnaire.petExperience] || 2;

    let score = 70;

    if (petTraits.needsTraining && userExp === 1) {
      score = 30;
    } else if (petTraits.needsTraining && userExp === 2) {
      score = 60;
    } else if (petTraits.needsTraining && userExp === 3) {
      score = 90;
    } else if (petTraits.isTrained && userExp === 1) {
      score = 95;
    } else if (petTraits.isTrained) {
      score = 90;
    } else if (userExp >= 2) {
      score = 85;
    }

    // Independent pets are better for first-timers who are away
    if (petTraits.socialLevel === "low" && userExp === 1) {
      score = Math.min(score + 10, 100);
    }

    const detail = `Your experience: ${questionnaire.petExperience.replace(/_/g, " ")}`;
    return { score, detail };
  }

  // Score: Household Compatibility
  _scoreHousehold(questionnaire, petTraits) {
    let score = 75;

    if (questionnaire.household === "family_with_kids") {
      if (petTraits.goodWithKids) score = 95;
      else if (petTraits.energyLevel === "high") score = 55;
      else score = 70;
    } else if (questionnaire.household === "single") {
      if (petTraits.socialLevel === "high") score = 85;
      else score = 80;
    } else if (questionnaire.household === "couple") {
      score = 85;
    } else if (questionnaire.household === "roommates") {
      if (petTraits.isNoisy) score = 50;
      else score = 75;
    }

    const detail = `Household: ${questionnaire.household.replace(/_/g, " ")}`;
    return { score, detail };
  }

  // Score: Noise Compatibility
  _scoreNoise(questionnaire, petTraits) {
    let score = 80;

    if (questionnaire.noiseTolerance === "low") {
      if (petTraits.isNoisy) score = 20;
      else if (petTraits.isQuiet) score = 100;
      else score = 70;
    } else if (questionnaire.noiseTolerance === "moderate") {
      if (petTraits.isNoisy) score = 55;
      else score = 85;
    } else if (questionnaire.noiseTolerance === "high") {
      score = 90;
    }

    const detail = `Noise tolerance: ${questionnaire.noiseTolerance}`;
    return { score, detail };
  }

  // Generate human-readable explanation
  _generateExplanation(questionnaire, pet, totalScore, scores) {
    const reasons = [];
    const concerns = [];

    // Energy match insights
    if (scores.energyScore.score >= 80) {
      if (questionnaire.preferredEnergy === "calm") {
        reasons.push("you prefer calm pets and this pet matches your energy preference");
      } else if (questionnaire.preferredEnergy === "energetic") {
        reasons.push("you enjoy active pets and this pet will keep up with your lifestyle");
      } else {
        reasons.push("this pet's energy level aligns well with your lifestyle");
      }
    } else if (scores.energyScore.score < 50) {
      concerns.push("the pet's energy level may not match your lifestyle");
    }

    // Space insights
    if (scores.spaceScore.score >= 80) {
      if (questionnaire.livingSpace === "apartment") {
        reasons.push("this pet is well-suited for apartment living");
      } else {
        reasons.push("your living space provides a great environment for this pet");
      }
    } else if (scores.spaceScore.score < 50) {
      if (questionnaire.livingSpace === "apartment") {
        concerns.push("this pet may need more space than an apartment provides");
      }
    }

    // Time insights
    if (scores.timeScore.score >= 80) {
      reasons.push("your schedule allows enough time to care for this pet");
    } else if (scores.timeScore.score < 50) {
      concerns.push("this pet may need more attention than your schedule allows");
    }

    // Experience insights
    if (scores.experienceScore.score >= 80) {
      if (questionnaire.petExperience === "first_time") {
        reasons.push("this pet is a great choice for first-time pet owners");
      } else {
        reasons.push("your experience level is a good fit for this pet");
      }
    } else if (scores.experienceScore.score < 50) {
      concerns.push("this pet may require more experience to handle properly");
    }

    // Household insights
    if (scores.householdScore.score >= 80 && questionnaire.household === "family_with_kids") {
      reasons.push("this pet is great with children and fits your family household");
    }

    // Noise insights
    if (scores.noiseScore.score < 50 && questionnaire.noiseTolerance === "low") {
      concerns.push("this pet may be noisier than you prefer");
    }

    // Build final explanation
    let explanation = "";

    if (totalScore >= 80) {
      explanation = `Great match! This pet suits you because ${reasons.slice(0, 3).join(", ")}.`;
    } else if (totalScore >= 60) {
      explanation = `Good match. This pet could work for you because ${reasons.length > 0 ? reasons.slice(0, 2).join(" and ") : "several of your preferences align"}.`;
      if (concerns.length > 0) {
        explanation += ` However, note that ${concerns[0]}.`;
      }
    } else if (totalScore >= 40) {
      explanation = `Moderate match. `;
      if (reasons.length > 0) {
        explanation += `On the positive side, ${reasons[0]}. `;
      }
      if (concerns.length > 0) {
        explanation += `However, ${concerns.slice(0, 2).join(" and ")}.`;
      }
    } else {
      explanation = `Low compatibility. This pet may not be the best fit because ${concerns.slice(0, 2).join(" and ")}.`;
      if (reasons.length > 0) {
        explanation += ` On the upside, ${reasons[0]}.`;
      }
    }

    return explanation;
  }

  // Delete user questionnaire
  async deleteQuestionnaire(userId) {
    const result = await compatibilityRepo.delete(userId);
    if (!result) throw new Error("No questionnaire found");
    return result;
  }
}

module.exports = new CompatibilityService();
