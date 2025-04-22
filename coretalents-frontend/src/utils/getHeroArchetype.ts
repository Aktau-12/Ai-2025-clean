import archetypes from "../data/hero_archetypes.json";
const API_URL = import.meta.env.VITE_API_URL;

interface UserProfile {
  mbti: string;
  bigfive: {
    O: number; // Openness
    C: number; // Conscientiousness
    E: number; // Extraversion
    A: number; // Agreeableness
    N: number; // Neuroticism (обратная Emotional Stability)
  };
  coretalents: string[]; // список top-5 талантов
}

export function getHeroArchetype(profile: UserProfile) {
  const { mbti, bigfive, coretalents } = profile;

  let scores: Record<string, number> = {};

  archetypes.forEach((arch) => {
    let score = 0;

    // MBTI совпадения
    if (arch.mbti_types.includes(mbti)) {
      score += 3;
    }

    // Big Five логика
    arch.bigfive_keywords?.forEach((trait) => {
      if (trait === "high_openness" && bigfive.O > 65) score += 2;
      if (trait === "low_extraversion" && bigfive.E < 40) score += 2;
      if (trait === "high_extraversion" && bigfive.E > 60) score += 2;
      if (trait === "high_conscientiousness" && bigfive.C > 60) score += 2;
      if (trait === "low_conscientiousness" && bigfive.C < 40) score += 2;
      if (trait === "high_agreeableness" && bigfive.A > 60) score += 2;
      if (trait === "high_emotional_stability" && bigfive.N < 40) score += 2;
    });

    // CoreTalents совпадения
    arch.coretalents_traits?.forEach((trait) => {
      if (coretalents.includes(trait)) score += 1;
    });

    scores[arch.code] = score;
  });

  // Найдём архетип с самым высоким баллом
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return archetypes.find((a) => a.code === top[0]);
}
