// src/pages/BigFiveResults.tsx
import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

type BigFiveData = {
  [K in "O" | "C" | "E" | "A" | "N"]?: number;
};

export default function BigFiveResults() {
  const [data, setData] = useState<BigFiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const traitLabels: Record<keyof BigFiveData, string> = {
    O: "Открытость опыту",
    C: "Сознательность",
    E: "Экстраверсия",
    A: "Доброжелательность",
    N: "Нейротизм",
  };

  const traitDescriptions: Record<keyof BigFiveData, string> = {
    O: "Ты склонен к любопытству, гибкости мышления и богатому воображению.",
    C: "Ты организован, ответственен и внимателен к деталям.",
    E: "Ты черпаешь энергию из общения и активного взаимодействия.",
    A: "Ты стремишься к гармонии и доверительным отношениям.",
    N: "Ты глубоко переживаешь события, эмоционально отзывчив.",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("⛔ Токен отсутствует. Пожалуйста, авторизуйтесь.");
          return;
        }

        const response = await axios.get(`${API_URL}/tests/2/result`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data || Object.keys(response.data).length === 0) {
          setError("⛔ Результаты Big Five отсутствуют. Пройдите тест.");
          return;
        }

        setData(response.data);
      } catch (err: any) {
        console.error("❌ Ошибка загрузки Big Five:", err.response?.data || err.message);
        setError("Ошибка загрузки данных. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">⏳ Загрузка результатов Big Five...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 space-y-4">
        <p>{error}</p>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
          >
            🔙 В меню
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            🚪 Выйти
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Нет данных для отображения.
      </div>
    );
  }

  const chartData = (Object.keys(data) as (keyof BigFiveData)[])
    .filter((t) => typeof data[t] === "number" && !isNaN(data[t]!))
    .map((trait) => ({
      trait,
      label: traitLabels[trait],
      value: data[trait]!,
      description: traitDescriptions[trait],
    }))
    .sort((a, b) => b.value - a.value);

  const top5 = chartData.slice(0, 5);

  return (
    <div className="mt-6 space-y-10 px-4">
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">
          📈 Ваш профиль Big Five
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis domain={[1, 5]} />
            <Tooltip />
            <Radar
              name="Профиль"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-center">
          🧠 Ваши черты личности от сильной к слабой
        </h3>

        {top5.map((trait, idx) => (
          <div
            key={trait.trait}
            className="p-5 border rounded-lg bg-yellow-50 shadow hover:shadow-md transition transform hover:scale-105"
          >
            <h4 className="text-yellow-800 font-bold text-lg mb-2">
              {idx + 1}. {trait.label} ({trait.value})
            </h4>
            <p className="text-yellow-700">{trait.description}</p>
          </div>
        ))}

        <div className="pt-8 space-y-6">
          {chartData.slice(5).map((trait, idx) => (
            <div
              key={trait.trait}
              className="p-4 border rounded-lg bg-white shadow hover:shadow-md transition"
            >
              <h4 className="text-purple-700 font-semibold mb-1">
                {idx + 6}. {trait.label} ({trait.value})
              </h4>
              <p className="text-gray-700">{trait.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10 flex justify-center space-x-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          🔙 В меню
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  );
}
