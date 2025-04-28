import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialCategories = [
  "Карьера",
  "Финансы",
  "Здоровье",
  "Отношения",
  "Развитие",
  "Отдых",
  "Творчество",
  "Духовность",
];

export default function LifeWheel() {
  const [scores, setScores] = useState<Record<string, number>>(
    initialCategories.reduce((acc, category) => ({ ...acc, [category]: 5 }), {})
  );
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleChange = (category: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/life-wheel/save`,
        { scores },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSaved(true);
    } catch (error) {
      console.error("Ошибка сохранения Колеса Жизни:", error);
      alert("Ошибка сохранения. Попробуйте позже.");
    }
  };

  const chartData = Object.keys(scores).map((category) => ({
    category,
    value: scores[category],
  }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">📈 Колесо Жизни</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 📊 График */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar
                name="Вы"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 📋 Форма */}
        <div className="space-y-4">
          {initialCategories.map((category) => (
            <div key={category} className="flex items-center gap-4">
              <label className="w-32 font-medium">{category}</label>
              <input
                type="range"
                min="0"
                max="10"
                value={scores[category]}
                onChange={(e) => handleChange(category, parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-center">{scores[category]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔘 Кнопки */}
      <div className="flex justify-center mt-8 gap-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          ✅ Сохранить
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          🔙 Назад в меню
        </button>
      </div>

      {saved && (
        <p className="text-center text-green-600 mt-6">
          🎉 Колесо Жизни успешно сохранено!
        </p>
      )}
    </div>
  );
}
