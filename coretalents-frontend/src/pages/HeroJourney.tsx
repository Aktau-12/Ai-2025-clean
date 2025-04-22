import React, { useEffect, useState } from "react";
import axios from "axios";
import HeroProfessions from "../components/HeroProfessions";
const API_URL = import.meta.env.VITE_API_URL;
const API_URL = import.meta.env.VITE_API_URL;

interface HeroStep {
  id: string;
  text: string;
  points: number;
  completed: boolean;
}

interface HeroStage {
  stage: string;
  title: string;
  description?: string;
  steps: HeroStep[];
}

export default function HeroJourney() {
  const [stages, setStages] = useState<HeroStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState<number>(0);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, userRes] = await Promise.all([
          axios.get("${API_URL}/hero/full", { headers }),
          axios.get("${API_URL}/users/me", { headers }),
        ]);
        setStages(heroRes.data.stages);
        setXp(userRes.data.xp || 0);
      } catch (err) {
        console.error("Ошибка загрузки пути героя или XP:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggle = async (step_id: string, completed: boolean) => {
    try {
      await axios.post(
        "${API_URL}/hero/progress",
        { step_id, completed: !completed },
        { headers }
      );

      setStages((prev) =>
        prev.map((stage) => ({
          ...stage,
          steps: stage.steps.map((s) =>
            s.id === step_id ? { ...s, completed: !completed } : s
          ),
        }))
      );

      const res = await axios.get("${API_URL}/users/me", { headers });
      setXp(res.data.xp || 0);
    } catch (err) {
      console.error("Ошибка обновления шага:", err);
    }
  };

  const level = Math.floor(Math.sqrt(xp / 10));
  const nextLevelXp = Math.pow(level + 1, 2) * 10;
  const currentLevelXp = Math.pow(level, 2) * 10;
  const progress = nextLevelXp - currentLevelXp
    ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    : 0;

  if (loading) return <div className="p-6 text-center">⏳ Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="bg-white border rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold">🎯 Уровень героя</h2>
        <p className="mt-2 text-sm text-gray-700">XP: {xp} | Уровень: {level}</p>
        <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">До следующего уровня: {nextLevelXp - xp} XP</p>
      </div>

      <HeroProfessions />

      {stages.map((stage) => (
        <div key={stage.stage} className="bg-white border rounded-xl p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">
            {stage.stage}. {stage.title}
          </h2>
          <p className="text-gray-600 mb-4 text-sm">{stage.description}</p>
          <ul className="space-y-2">
            {stage.steps.map((step) => (
              <li key={step.id} className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => handleToggle(step.id, step.completed)}
                    className="accent-green-600"
                  />
                  <span>{step.text}</span>
                </label>
                <span className="text-xs text-gray-500">+{step.points} XP</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="inline-block mt-8 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm shadow"
        >
          🔙 Назад в меню
        </button>
      </div>
    </div>
  );
}
