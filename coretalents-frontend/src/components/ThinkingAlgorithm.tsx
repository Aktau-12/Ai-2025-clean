import React, { useState } from "react";
import HabitTracker from "../pages/HabitTracker";

const steps = [
  { question: "🧠 Какая у тебя сейчас задача или проблема?", placeholder: "Опиши кратко" },
  { question: "🔍 Что ты уже пробовал сделать?", placeholder: "Опиши кратко" },
  { question: "🎯 Какая твоя конечная цель?", placeholder: "Опиши" },
  { question: "🧩 Какие ресурсы у тебя есть?", placeholder: "Люди, знания, опыт" },
  { question: "🚧 Какие ограничения?", placeholder: "Страхи, нехватка времени" },
  { question: "💡 Минимум 3 возможных пути?", placeholder: "Три варианта" },
  { question: "✅ Какой вариант выбираешь?", placeholder: "Выбери лучший" },
  { question: "📅 Когда начнёшь?", placeholder: "Дата и время" },
];

const ThinkingAlgorithm = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(steps.length).fill(""));
  const [finished, setFinished] = useState(false);
  const [addHabit, setAddHabit] = useState(false);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[stepIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  if (finished) {
    return (
      <div className="bg-white rounded-xl shadow p-6 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Поздравляем! Вы завершили алгоритм мышления!</h2>
        <div className="text-left space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="border-b pb-2">
              <p className="font-semibold">{step.question}</p>
              <p className="text-gray-700">{answers[idx] || "Не заполнено"}</p>
            </div>
          ))}
        </div>

        {!addHabit ? (
          <button
            onClick={() => setAddHabit(true)}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
          >
            🔄 Добавить как привычку
          </button>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">🧩 Добавление в привычки:</h3>
            <HabitTracker />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-xl font-bold text-center mb-4">🧠 Алгоритм мышления</h2>

      <div>
        <p className="text-lg font-medium mb-2">{steps[stepIndex].question}</p>
        <textarea
          value={answers[stepIndex]}
          onChange={handleChange}
          rows={4}
          placeholder={steps[stepIndex].placeholder}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          ⬅ Назад
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {stepIndex === steps.length - 1 ? "Завершить ✅" : "Далее ➡"}
        </button>
      </div>
    </div>
  );
};

export default ThinkingAlgorithm;
