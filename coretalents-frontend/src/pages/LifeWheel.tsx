import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const areas = [
  "Здоровье",
  "Карьера",
  "Финансы",
  "Любовь",
  "Личностный рост",
  "Друзья",
  "Развлечения",
  "Саморазвитие",
];

export default function LifeWheel() {
  const [scores, setScores] = useState<number[]>(Array(areas.length).fill(5));
  const navigate = useNavigate();

  const handleChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const chartData = areas.map((area, idx) => ({
    area,
    score: scores[idx],
  }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
        📈 Колесо жизни
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🎯 Ввод оценок */}
        <div className="space-y-4">
          {areas.map((area, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <label className="text-gray-700 font-medium">{area}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={scores[idx]}
                onChange={(e) => handleChange(idx, Number(e.target.value))}
                className="ml-4 w-48"
              />
              <span className="ml-2 text-gray-600">{scores[idx]}</span>
            </div>
          ))}
        </div>

        {/* 📊 График */}
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="area" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Tooltip />
              <Radar
                name="Уровень жизни"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔙 Назад в меню */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          🔙 Вернуться в меню
        </button>
      </div>
    </div>
  );
}
