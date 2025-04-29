import React, { useEffect, useState } from "react";
import { getHeroArchetype } from "../utils/getHeroArchetype";
import archetypes from "../data/hero_archetypes.json";
import stepsData from "../data/hero_steps.json";
import axios from "axios";
import HeroCoach from "./HeroCoach";

const API_URL = import.meta.env.VITE_API_URL;

export default function HeroPath() {
  const [archetype, setArchetype] = useState<any>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const heroPathStages = [
    "🪞 Пробуждение",
    "🚶 Первые шаги",
    "🧠 Внутренний рост",
    "🔥 Испытания",
    "🏆 Раскрытие потенциала",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Получаем данные пользователя
        const userRes = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userRes.data;

        // Получаем прогресс героя
        const progressRes = await axios.get(`${API_URL}/hero/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const completedSteps: string[] = progressRes.data || [];
        const progressMap: Record<string, boolean> = {};
        completedSteps.forEach((id) => {
          progressMap[id] = true;
        });
        setCheckedSteps(progressMap);

        // Устанавливаем профиль
        setUserProfile({
          mbti: userData.mbti_type,
          bigfive: userData.bigfive_scores || {}, // предполагаем, что сервер отдаёт
          coretalents: userData.coretalents || [],
        });

        const hero = getHeroArchetype({
          mbti: userData.mbti_type,
          bigfive: userData.bigfive_scores,
          coretalents: userData.coretalents,
        });

        setArchetype(hero);
      } catch (err) {
        console.error("❌ Ошибка загрузки профиля или прогресса:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStepToggle = async (stepId: string) => {
    const updated = !checkedSteps[stepId];
    setCheckedSteps((prev) => ({ ...prev, [stepId]: updated }));

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/hero/progress`,
        { step_id: stepId, completed: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Ошибка при обновлении шага:", err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">⏳ Загрузка пути героя...</div>;
  }

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalSteps = stepsData.flatMap((stage) => stage.steps).length;
  const progressPercent = ((completedCount / totalSteps) * 100).toFixed(0);

  // Определение текущего этапа по количеству выполненных шагов
  const currentStage = Math.min(
    Math.floor((completedCount / totalSteps) * heroPathStages.length) + 1,
    heroPathStages.length
  );

  const stageData = stepsData.find((s) => s.stage === currentStage);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">🛤️ Путь героя</h2>

      {archetype && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-2xl font-semibold text-purple-600 mb-2">
            🧬 Твой архетип: {archetype.name}
          </h3>
          <p className="text-gray-700">{archetype.description}</p>
        </div>
      )}

      {/* Прогресс пути */}
      <div className="bg-blue-100 p-4 rounded-lg text-center text-blue-700 font-medium">
        Прогресс пути: {completedCount} из {totalSteps} шагов ({progressPercent}%)
      </div>

      {/* Этапы пути */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {heroPathStages.map((stage, index) => (
          <div
            key={index}
            className={`border p-4 rounded-xl transition text-center font-medium ${
              index + 1 === currentStage
                ? "bg-purple-100 border-purple-400"
                : "bg-gray-100 border-gray-200 opacity-70"
            }`}
          >
            {stage}
          </div>
        ))}
      </div>

      {/* Текущие задачи */}
      {stageData && (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold">
            ✅ Задачи на этапе «{stageData.title}»
          </h4>
          <ul className="space-y-3">
            {stageData.steps.map((step) => (
              <li
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  checkedSteps[step.id]
                    ? "bg-green-100 border-green-400"
                    : "bg-white border-gray-300"
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedSteps[step.id] || false}
                    onChange={() => handleStepToggle(step.id)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">{step.text}</span>
                </label>
                <span className="text-xs text-gray-500">🎯 {step.points} XP</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI-наставник */}
      {userProfile && (
        <HeroCoach
          archetype={archetype}
          bigfive={userProfile.bigfive}
          completedSteps={Object.keys(checkedSteps).filter((key) => checkedSteps[key])}
        />
      )}
    </div>
  );
}
