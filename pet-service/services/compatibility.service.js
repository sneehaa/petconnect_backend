const mongoose = require("mongoose");
const compatibilityRepo = require("../repositories/compatibility.repository");
const petRepo = require("../repositories/pet.repository");

const ENERGY_KEYWORDS = {
  high: [
    "energetic",
    "active",
    "playful",
    "hyper",
    "bouncy",
    "lively",
    "spirited",
    "athletic",
    "vigorous",
    "high-energy",
  ],
  moderate: [
    "moderate",
    "balanced",
    "adaptable",
    "easygoing",
    "easy-going",
    "flexible",
    "versatile",
    "average",
  ],
  low: [
    "calm",
    "lazy",
    "relaxed",
    "chill",
    "quiet",
    "gentle",
    "mellow",
    "laid-back",
    "laidback",
    "docile",
    "serene",
    "low-energy",
  ],
};

const SOCIAL_KEYWORDS = {
  high: [
    "friendly",
    "social",
    "affectionate",
    "loving",
    "cuddly",
    "loyal",
    "devoted",
    "clingy",
    "needy",
    "attached",
    "people-oriented",
  ],
  moderate: [
    "sociable",
    "companionable",
    "amiable",
    "pleasant",
    "good-natured",
    "balanced",
  ],
  low: [
    "independent",
    "aloof",
    "reserved",
    "solitary",
    "distant",
    "detached",
    "self-reliant",
    "shy",
    "timid",
  ],
};

const TEMPERAMENT_KEYWORDS = {
  good_with_kids: [
    "gentle",
    "patient",
    "tolerant",
    "friendly",
    "good with kids",
    "family-friendly",
    "kid-friendly",
    "loving",
    "child-friendly",
  ],
  good_with_pets: [
    "good with pets",
    "pet-friendly",
    "gets along with animals",
    "social with animals",
  ],
  noisy: [
    "vocal",
    "barky",
    "loud",
    "noisy",
    "talkative",
    "howler",
    "yappy",
    "barks",
  ],
  quiet: ["quiet", "calm", "silent", "reserved", "mellow", "peaceful"],
  trained: [
    "trained",
    "obedient",
    "well-behaved",
    "disciplined",
    "well-mannered",
    "housebroken",
    "potty-trained",
  ],
  needs_training: [
    "stubborn",
    "untrained",
    "wild",
    "mischievous",
    "naughty",
    "challenging",
    "willful",
    "hard to train",
  ],
};

class CompatibilityService {
  async saveQuestionnaire(userId, data) {
    data.userId = userId;
    return compatibilityRepo.update(userId, data);
  }

  async getQuestionnaire(userId) {
    const questionnaire = await compatibilityRepo.findByUserId(userId);
    if (!questionnaire) throw new Error("No questionnaire found");
    return questionnaire;
  }

  async getCompatibilityWithPet(userId, petId) {
    if (!mongoose.Types.ObjectId.isValid(petId))
      throw new Error("Invalid pet ID");

    const questionnaire = await compatibilityRepo.findByUserId(userId);
    if (!questionnaire) throw new Error("No questionnaire found");

    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");

    const result = this._calculateCompatibility(questionnaire, pet);
    return {
      pet: pet.toObject(),
      ...result,
    };
  }

  async getCompatibilityAll(userId, limit = 50, page = 1) {
    const questionnaire = await compatibilityRepo.findByUserId(userId);
    if (!questionnaire) throw new Error("No questionnaire found");

    const pets = await petRepo.getAll();
    const availablePets = pets.filter((pet) => pet.status === "available");

    const skip = (page - 1) * limit;
    const paginatedPets = availablePets.slice(skip, skip + limit);

    const results = paginatedPets.map((pet) => {
      const result = this._calculateCompatibility(questionnaire, pet);
      return {
        pet: pet.toObject(),
        compatibilityScore: result.compatibilityScore,
        explanation: result.explanation,
        breakdown: result.breakdown,
      };
    });

    results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return {
      results,
      pagination: {
        page,
        limit,
        total: availablePets.length,
        totalPages: Math.ceil(availablePets.length / limit),
        hasNextPage: skip + limit < availablePets.length,
        hasPrevPage: page > 1,
      },
    };
  }

  async deleteQuestionnaire(userId) {
    const result = await compatibilityRepo.delete(userId);
    if (!result) throw new Error("No questionnaire found");
    return result;
  }

  _calculateCompatibility(questionnaire, pet) {
    const personalityText = (pet.personality || "").toLowerCase();
    const petTraits = this._extractTraits(personalityText);
    const ageTraits = this._inferAgeTraits(pet.age || 1);

    const energyScore = this._scoreEnergy(questionnaire, petTraits, ageTraits);
    const spaceScore = this._scoreSpace(questionnaire, petTraits, ageTraits);
    const timeScore = this._scoreTime(questionnaire, petTraits);
    const experienceScore = this._scoreExperience(questionnaire, petTraits);
    const householdScore = this._scoreHousehold(questionnaire, petTraits);
    const noiseScore = this._scoreNoise(questionnaire, petTraits);

    const weights = {
      energy: 0.25,
      space: 0.2,
      time: 0.2,
      experience: 0.15,
      household: 0.1,
      noise: 0.1,
    };

    const totalScore = Math.round(
      energyScore.score * weights.energy +
        spaceScore.score * weights.space +
        timeScore.score * weights.time +
        experienceScore.score * weights.experience +
        householdScore.score * weights.household +
        noiseScore.score * weights.noise,
    );

    const explanation = this._generateExplanation(
      questionnaire,
      pet,
      totalScore,
      {
        energyScore,
        spaceScore,
        timeScore,
        experienceScore,
        householdScore,
        noiseScore,
      },
    );

    return {
      compatibilityScore: Math.min(100, Math.max(0, totalScore)),
      explanation,
      breakdown: {
        energy: {
          score: energyScore.score,
          weight: "25%",
          detail: energyScore.detail,
        },
        space: {
          score: spaceScore.score,
          weight: "20%",
          detail: spaceScore.detail,
        },
        time: {
          score: timeScore.score,
          weight: "20%",
          detail: timeScore.detail,
        },
        experience: {
          score: experienceScore.score,
          weight: "15%",
          detail: experienceScore.detail,
        },
        household: {
          score: householdScore.score,
          weight: "10%",
          detail: householdScore.detail,
        },
        noise: {
          score: noiseScore.score,
          weight: "10%",
          detail: noiseScore.detail,
        },
      },
    };
  }

  _extractTraits(text) {
    if (!text || typeof text !== "string") {
      return {
        energyLevel: "moderate",
        socialLevel: "moderate",
        goodWithKids: false,
        goodWithPets: false,
        isNoisy: false,
        isQuiet: false,
        isTrained: false,
        needsTraining: false,
      };
    }

    const lowerText = text.toLowerCase();
    const traits = {
      energyLevel: "moderate",
      socialLevel: "moderate",
      goodWithKids: false,
      goodWithPets: false,
      isNoisy: false,
      isQuiet: false,
      isTrained: false,
      needsTraining: false,
    };

    const highEnergyCount = ENERGY_KEYWORDS.high.filter((k) =>
      lowerText.includes(k),
    ).length;
    const lowEnergyCount = ENERGY_KEYWORDS.low.filter((k) =>
      lowerText.includes(k),
    ).length;

    if (highEnergyCount > lowEnergyCount) traits.energyLevel = "high";
    else if (lowEnergyCount > highEnergyCount) traits.energyLevel = "low";

    const highSocialCount = SOCIAL_KEYWORDS.high.filter((k) =>
      lowerText.includes(k),
    ).length;
    const lowSocialCount = SOCIAL_KEYWORDS.low.filter((k) =>
      lowerText.includes(k),
    ).length;

    if (highSocialCount > lowSocialCount) traits.socialLevel = "high";
    else if (lowSocialCount > highSocialCount) traits.socialLevel = "low";

    traits.goodWithKids = TEMPERAMENT_KEYWORDS.good_with_kids.some((k) =>
      lowerText.includes(k),
    );
    traits.goodWithPets = TEMPERAMENT_KEYWORDS.good_with_pets.some((k) =>
      lowerText.includes(k),
    );
    traits.isNoisy = TEMPERAMENT_KEYWORDS.noisy.some((k) =>
      lowerText.includes(k),
    );
    traits.isQuiet = TEMPERAMENT_KEYWORDS.quiet.some((k) =>
      lowerText.includes(k),
    );
    traits.isTrained = TEMPERAMENT_KEYWORDS.trained.some((k) =>
      lowerText.includes(k),
    );
    traits.needsTraining = TEMPERAMENT_KEYWORDS.needs_training.some((k) =>
      lowerText.includes(k),
    );

    return traits;
  }

  _inferAgeTraits(age) {
    if (age < 1)
      return {
        energyModifier: "high",
        needsAttention: "high",
        trainability: "needs_training",
      };
    if (age <= 3)
      return {
        energyModifier: "high",
        needsAttention: "moderate",
        trainability: "moderate",
      };
    if (age <= 7)
      return {
        energyModifier: "moderate",
        needsAttention: "moderate",
        trainability: "trained",
      };
    return {
      energyModifier: "low",
      needsAttention: "moderate",
      trainability: "trained",
    };
  }

  _scoreEnergy(questionnaire, petTraits, ageTraits) {
    let score = 50;
    let detail = "";

    const userPreferred = questionnaire.preferredEnergy;
    const petEnergy =
      ageTraits.energyModifier === "high"
        ? "high"
        : ageTraits.energyModifier === "low"
          ? "low"
          : petTraits.energyLevel;

    const energyMap = {
      calm: { high: 20, moderate: 60, low: 100 },
      moderate: { high: 60, moderate: 100, low: 60 },
      energetic: { high: 100, moderate: 60, low: 20 },
    };

    score = energyMap[userPreferred][petEnergy] || 50;

    if (score >= 80)
      detail = `Your preference for ${userPreferred} pets matches ${pet.name}'s energy level`;
    else if (score >= 60)
      detail = `Moderate match between your ${userPreferred} preference and ${pet.name}'s energy`;
    else
      detail = `${pet.name}'s energy level may not match your ${userPreferred} preference`;

    return { score, detail };
  }

  _scoreSpace(questionnaire, petTraits, ageTraits) {
    let score = 50;
    let detail = "";

    const userSpace = questionnaire.livingSpace;
    const hasYard = questionnaire.hasYard;
    const petEnergy =
      ageTraits.energyModifier === "high" ? "high" : petTraits.energyLevel;

    const spaceRequirements = {
      apartment: { high: 40, moderate: 70, low: 90 },
      house_small: { high: 70, moderate: 90, low: 100 },
      house_large: { high: 90, moderate: 100, low: 100 },
      farm: { high: 100, moderate: 100, low: 100 },
    };

    score = spaceRequirements[userSpace][petEnergy] || 50;

    if (petEnergy === "high" && hasYard) score = Math.min(100, score + 20);
    if (petEnergy === "high" && !hasYard) score = Math.max(0, score - 15);

    if (score >= 80)
      detail = `${pet.name} is suitable for your ${userSpace.replace("_", " ")}`;
    else if (score >= 60)
      detail = `${pet.name} may adapt to your ${userSpace.replace("_", " ")} with adjustments`;
    else
      detail = `${pet.name} might need more space than your ${userSpace.replace("_", " ")} provides`;

    return { score, detail };
  }

  _scoreTime(questionnaire, petTraits) {
    let score = 50;
    let detail = "";

    const userTime = questionnaire.timeForPet;
    const workSchedule = questionnaire.workSchedule;
    const petSocial = petTraits.socialLevel;
    const needsAttention =
      petTraits.needsTraining || petTraits.socialLevel === "high";

    const timeScoreMap = {
      limited: { high: 30, moderate: 60, low: 80 },
      moderate: { high: 70, moderate: 90, low: 60 },
      extensive: { high: 100, moderate: 80, low: 50 },
    };

    score = timeScoreMap[userTime][petSocial] || 50;

    if (workSchedule === "home_all_day" && needsAttention)
      score = Math.min(100, score + 20);
    if (workSchedule === "full_time_away" && needsAttention)
      score = Math.max(0, score - 20);

    if (score >= 80)
      detail = `Your schedule and time commitment match ${pet.name}'s needs`;
    else if (score >= 60)
      detail = `Moderate match between your availability and ${pet.name}'s needs`;
    else
      detail = `${pet.name} may need more time and attention than you can provide`;

    return { score, detail };
  }

  _scoreExperience(questionnaire, petTraits) {
    let score = 50;
    let detail = "";

    const userExp = questionnaire.petExperience;
    const petNeedsExp =
      petTraits.needsTraining || petTraits.energyLevel === "high";

    const expScoreMap = {
      first_time: { high: 40, low: 90 },
      some_experience: { high: 70, low: 100 },
      experienced: { high: 100, low: 100 },
    };

    score = expScoreMap[userExp][petNeedsExp ? "high" : "low"] || 50;

    if (score >= 80)
      detail = `Your ${userExp.replace("_", " ")} level is suitable for ${pet.name}`;
    else if (score >= 60)
      detail = `${pet.name} may be manageable with your ${userExp.replace("_", " ")}`;
    else
      detail = `${pet.name} might be challenging for your ${userExp.replace("_", " ")} level`;

    return { score, detail };
  }

  _scoreHousehold(questionnaire, petTraits) {
    let score = 50;
    let detail = "";

    const household = questionnaire.household;
    const hasAllergies = questionnaire.hasAllergies;
    const goodWithKids = petTraits.goodWithKids;

    const householdScoreMap = {
      single: { good: 80, average: 90 },
      couple: { good: 90, average: 100 },
      family_with_kids: { good: 100, average: 70 },
      roommates: { good: 80, average: 90 },
    };

    const key = goodWithKids ? "good" : "average";
    score = householdScoreMap[household][key] || 50;

    if (hasAllergies && household === "family_with_kids")
      score = Math.max(0, score - 30);

    if (score >= 80)
      detail = `${pet.name} is compatible with your ${household.replace("_", " ")} situation`;
    else if (score >= 60)
      detail = `Moderate compatibility with your ${household.replace("_", " ")}`;
    else
      detail = `${pet.name} may not be ideal for your ${household.replace("_", " ")}`;

    return { score, detail };
  }

  _scoreNoise(questionnaire, petTraits) {
    let score = 50;
    let detail = "";

    const noiseTolerance = questionnaire.noiseTolerance;
    const isNoisy = petTraits.isNoisy;
    const isQuiet = petTraits.isQuiet;

    const noiseScoreMap = {
      low: { noisy: 30, quiet: 100, average: 80 },
      moderate: { noisy: 70, quiet: 90, average: 100 },
      high: { noisy: 100, quiet: 80, average: 90 },
    };

    let petNoiseLevel = "average";
    if (isNoisy) petNoiseLevel = "noisy";
    if (isQuiet) petNoiseLevel = "quiet";

    score = noiseScoreMap[noiseTolerance][petNoiseLevel] || 50;

    if (score >= 80)
      detail = `Your noise tolerance matches ${pet.name}'s vocal tendencies`;
    else if (score >= 60) detail = `Moderate match for noise level`;
    else
      detail = `${pet.name}'s vocalization may not suit your noise tolerance`;

    return { score, detail };
  }

  _generateExplanation(questionnaire, pet, totalScore, scores) {
    const explanations = [];

    if (totalScore >= 80) {
      explanations.push(
        `Excellent match! ${pet.name} aligns well with your lifestyle preferences.`,
      );
    } else if (totalScore >= 60) {
      explanations.push(
        `Good match! ${pet.name} could be a great companion with some adjustments.`,
      );
    } else if (totalScore >= 40) {
      explanations.push(
        `Fair match. Consider if you can accommodate ${pet.name}'s needs.`,
      );
    } else {
      explanations.push(
        `Limited compatibility. ${pet.name} may not be the best fit for your current situation.`,
      );
    }

    const lowestScore = Math.min(
      scores.energyScore.score,
      scores.spaceScore.score,
      scores.timeScore.score,
      scores.experienceScore.score,
      scores.householdScore.score,
      scores.noiseScore.score,
    );

    if (lowestScore < 40) {
      if (scores.energyScore.score < 40)
        explanations.push("Energy level mismatch is a significant factor.");
      if (scores.spaceScore.score < 40)
        explanations.push("Space requirements may be inadequate.");
      if (scores.timeScore.score < 40)
        explanations.push("Time commitment may be insufficient.");
      if (scores.experienceScore.score < 40)
        explanations.push("Experience level may be inadequate.");
    }

    const strengths = [];
    if (scores.energyScore.score >= 80) strengths.push("energy level");
    if (scores.spaceScore.score >= 80) strengths.push("space compatibility");
    if (scores.timeScore.score >= 80) strengths.push("time availability");

    if (strengths.length > 0) {
      explanations.push(`Strong matches in: ${strengths.join(", ")}.`);
    }

    return explanations.join(" ");
  }
}

module.exports = new CompatibilityService();
