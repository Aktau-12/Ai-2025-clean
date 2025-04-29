import archetypes from "../data/hero_archetypes.json";

interface UserProfile {
  mbti: string;
  bigfive: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  coretalents: string[];
}

export function getHeroArchetype(profile: UserProfile) {
  if (!profile || !profile.mbti || !profile.bigfive || !profile.coretalents) {
    console.error("❌ Невалидный профиль для расчета архетипа");
    return null;
  }

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

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  if (!top) {
    console.warn("⚠️ Архетип не определён, возвращаем дефолтного 'Искателя'");
    return archetypes.find((a) => a.code === "seeker"); // ← имя дефолтного архетипа
  }

  const selected = archetypes.find((a) => a.code === top[0]);
  console.log(`🎯 Выбран архетип: ${selected?.name || "Не найден"}`);

  return selected;
}
