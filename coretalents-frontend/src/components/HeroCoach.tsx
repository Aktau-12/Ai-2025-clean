import React from "react";
const API_URL = import.meta.env.VITE_API_URL;


type Props = {
  archetype: any;
  bigfive: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  completedSteps: string[];
};

const HeroCoach: React.FC<Props> = ({ archetype, bigfive, completedSteps }) => {
  if (!archetype) return null;

  const tips: string[] = [];

  // 🔍 На основе архетипа
  if (archetype.name === "Творец") {
    tips.push("Записывай идеи каждый день. Даже самые безумные.");
    tips.push("Сфокусируйся на одном проекте хотя бы на неделю.");
  } else if (archetype.name === "Исследователь") {
    tips.push("Пробуй новое каждый день — книги, места, люди.");
    tips.push("Не забудь доводить до конца начатое.");
  }

  // 🧠 Big Five
  if (bigfive.N > 60) {
    tips.push("Практикуй дыхательные техники и веди дневник эмоций.");
  }
  if (bigfive.C < 50) {
    tips.push("Попробуй планировать день накануне вечером.");
  }
  if (bigfive.E > 70) {
    tips.push("Общайся с людьми — это твой источник энергии.");
  }

  // 🚀 Прогресс
  if (completedSteps.length < 3) {
    tips.push("Сделай первые 3 шага — это заложит фундамент.");
  } else {
    tips.push("Продолжай! Твой путь уже начался — не останавливайся.");
  }

  return (
    <div className="mt-10 bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow space-y-3">
      <h3 className="text-xl font-bold text-yellow-800">🎓 AI-наставник</h3>
      <p className="text-sm text-yellow-700">
        Вот персональные рекомендации, основанные на твоём профиле:
      </p>
      <ul className="list-disc pl-5 text-sm text-yellow-900">
        {tips.map((tip, idx) => (
          <li key={idx}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};

export default HeroCoach;


