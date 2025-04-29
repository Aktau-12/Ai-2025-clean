import React from "react";

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
  if (!archetype) {
    return (
      <div className="text-center text-gray-500 p-4">
        Нет данных для наставника. Завершите тесты!
      </div>
    );
  }

  const tips: string[] = [];

  // 🔍 Рекомендации по архетипу
  switch (archetype.name) {
    case "Творец":
      tips.push("Записывай идеи каждый день, даже самые безумные 💡.");
      tips.push("Сфокусируйся на одном проекте хотя бы на неделю 🎯.");
      break;
    case "Исследователь":
      tips.push("Пробуй новое каждый день — книги, места, люди 🌍.");
      tips.push("Не забудь доводить начатое до конца 🚀.");
      break;
    default:
      tips.push("Развивай свои сильные стороны и исследуй новые горизонты ✨.");
  }

  // 🧠 Рекомендации на основе Big Five
  if (bigfive.N > 60) {
    tips.push("Практикуй дыхательные техники и веди дневник эмоций 🧘‍♂️.");
  }
  if (bigfive.C < 50) {
    tips.push("Планируй свой день заранее 📅.");
  }
  if (bigfive.E > 70) {
    tips.push("Общение — твой заряд энергии 🔋. Находи новые знакомства.");
  }

  // 🚀 Прогресс по шагам
  if (completedSteps.length < 3) {
    tips.push("Сделай первые 3 шага — заложи основу успеха 🏗️.");
  } else if (completedSteps.length < 10) {
    tips.push("Ты на правильном пути! Продолжай двигаться вперед 💪.");
  } else {
    tips.push("Ты достиг высокого уровня! Поделись опытом с другими 🌟.");
  }

  return (
    <div className="mt-10 bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow space-y-4">
      <h3 className="text-2xl font-bold text-yellow-800 text-center">🧙‍♂️ AI-наставник</h3>
      <p className="text-center text-yellow-700">
        Персональные советы, основанные на твоём пути:
      </p>
      <ul className="list-disc pl-6 mt-4 text-yellow-900 text-sm space-y-2">
        {tips.map((tip, idx) => (
          <li key={idx}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};

export default HeroCoach;
