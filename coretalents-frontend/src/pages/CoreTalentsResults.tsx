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
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await axios.get(`${API_URL}/tests/1/results`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Ожидаем, что сервер возвращает объект: { scores: { [talentId: string]: number } }
        const scores: Record<string, number> = response.data.scores || {};

        // Формируем и сортируем результаты
        const sortedResults = Object.entries(scores)
          .map(([talentId, score]) => {
            const id = Number(talentId);
            const talent = talentsData.find((t) => Number(t.id) === id);
            return {
              id,
              name: talent?.name ?? `Талант ${id}`,
              description: talent?.description ?? "Описание не найдено",
              details: talent?.details ?? "",
              score,
            } as TalentResultType;
          })
          .sort((a, b) => b.score - a.score);

        setResults(sortedResults);
      } catch (error: any) {
        console.error(
          "❌ Ошибка загрузки результатов:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Загрузка результатов...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        📋 Все 34 таланта CoreTalents
      </h2>

      {results.length === 0 ? (
        <p className="text-center text-gray-500">
          Нет доступных результатов
        </p>
      ) : (
        results.map((res, idx) => (
          <div
            key={res.id}
            className="border p-4 rounded-lg shadow bg-white hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">
              {idx + 1}. {res.name}
            </h3>
            <p className="text-sm text-gray-700 mt-1">{res.description}</p>
            {res.details && (
              <p className="text-sm text-gray-500 mt-2 italic">
                {res.details}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Баллы: {res.score}
            </p>
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
            localStorage.removeItem("token");
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


  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        📋 Все 34 таланта CoreTalents
      </h2>

      {results.length === 0 ? (
        <p className="text-center text-gray-500">Нет доступных результатов</p>
      ) : (
        results.map((res, idx) => (
          <div
            key={res.id}
            className="border p-4 rounded-lg shadow bg-white hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">
              {getNumbering(idx)} {res.name}
            </h3>
            <p className="text-sm text-gray-700 mt-1">{res.description}</p>
            {res.details && (
              <p className="text-sm text-gray-500 mt-2 italic">{res.details}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Баллы: {res.score}</p> {/* Отображаем баллы */}
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
            localStorage.removeItem("token");
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
