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

type BigFiveData = {
  [K in "O" | "C" | "E" | "A" | "N"]?: number;
};

export default function BigFiveResults() {
  const [data, setData] = useState<BigFiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const traitLabels: Record<keyof BigFiveData, string> = {
    O: "Открытость опыту",
    C: "Сознательность",
    E: "Экстраверсия",
    A: "Доброжелательность",
    N: "Нейротизм",
  };

  const traitDescriptions: Record<keyof BigFiveData, string> = {
    O: "Ты склонен к любопытству, гибкости мышления и богатому воображению...",
    C: "Ты организован, ответственен и внимателен к деталям...",
    E: "Ты черпаешь энергию из общения и активного взаимодействия...",
    A: "Ты стремишься к гармонии и доверительным отношениям...",
    N: "Ты глубоко переживаешь всё, что происходит...",
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${API_URL}/tests/2/result`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.data || Object.keys(response.data).length === 0) {
          setError("Результаты Big Five отсутствуют. Пожалуйста, пройдите тест.");
          return;
        }

        setData(response.data);
      } catch (err: any) {
        console.error("❌ Ошибка загрузки Big Five:", err.response?.data || err.message);
        setError("Ошибка загрузки результатов. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">⏳ Загрузка результатов Big Five...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 space-y-4">
        <p>{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          🔙 Назад в меню
        </button>
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

  return (
    <div className="mt-6 space-y-10">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          🔍 Визуализация результатов Big Five
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={chartData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis domain={[1, 5]} />
            <Tooltip />
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

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          🧠 Описание ваших черт личности:
        </h3>
        {chartData.map((trait, idx) => (
          <div
            key={trait.trait}
            className="p-4 border rounded-lg bg-white shadow"
          >
            <h4 className="text-purple-700 font-bold text-md mb-2">
              {idx + 1}. {trait.label}
            </h4>
            <p className="text-gray-700">
              {trait.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/dashboard");
          }}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
        >
          🔙 В меню
        </button>
      </div>
    </div>
  );
}
