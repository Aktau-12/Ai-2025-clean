// src/pages/CoreTalentsResults.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import talentsData from "../data/coretalents_results_data.json";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type TalentResultType = {
  id: number;
  name: string;
  description: string;
  details: string;
  score: number;
};

export default function CoreTalentsResults() {
  const [results, setResults] = useState<TalentResultType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("⛔ Токен отсутствует. Пожалуйста, войдите снова.");
          return;
        }

        const response = await axios.get(`${API_URL}/tests/1/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const scores: Record<string, number> = response.data.scores || {};

        if (Object.keys(scores).length === 0) {
          setError("⛔ Результаты CoreTalents отсутствуют. Пройдите тест.");
          return;
        }

        const mappedResults = Object.entries(scores)
          .map(([talentId, score]) => {
            const talent = talentsData.find((t) => Number(t.id) === Number(talentId));
            return {
              id: Number(talentId),
              name: talent?.name || `Талант ${talentId}`,
              description: talent?.description || "Описание отсутствует",
              details: talent?.details || "",
              score: Number(score) || 0, // Защита от NaN
            };
          })
          .sort((a, b) => b.score - a.score); // Сортировка по убыванию баллов

        setResults(mappedResults);
      } catch (error: any) {
        console.error("❌ Ошибка загрузки результатов:", error);
        setError("Ошибка при загрузке результатов. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getNumbering = (index: number) => `${index + 1}.`;

  if (loading) {
    return <div className="p-6 text-center">⏳ Загрузка результатов...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const top5 = results.slice(0, 5);
  const allTalents = results.slice(5);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        🏆 Ваши Топ-5 талантов
      </h2>

      {top5.map((res, idx) => (
        <div
          key={res.id}
          className="border p-4 rounded-lg shadow bg-yellow-50 hover:shadow-lg transition transform hover:scale-105"
        >
          <h3 className="text-lg font-semibold text-yellow-800">
            {getNumbering(idx)} {res.name}
          </h3>
          <p className="text-sm text-yellow-700 mt-1">{res.description}</p>
          {res.details && (
            <p className="text-xs text-yellow-600 mt-2 italic">{res.details}</p>
          )}
          <p className="text-xs text-yellow-500 mt-2">Баллы: {res.score}</p>
        </div>
      ))}

      <h2 className="text-2xl font-bold text-center mt-10 mb-6">
        📋 Все 34 таланта
      </h2>

      {allTalents.length === 0 ? (
        <p className="text-center text-gray-500">Нет доступных результатов.</p>
      ) : (
        allTalents.map((res, idx) => (
          <div
            key={res.id}
            className="border p-4 rounded-lg shadow bg-white hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">
              {getNumbering(idx + 5)} {res.name}
            </h3>
            <p className="text-sm text-gray-700 mt-1">{res.description}</p>
            {res.details && (
              <p className="text-xs text-gray-500 mt-2 italic">{res.details}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Баллы: {res.score}</p>
          </div>
        ))
      )}

      <div className="text-center mt-10 space-x-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          🔙 Назад в меню
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  );
}
