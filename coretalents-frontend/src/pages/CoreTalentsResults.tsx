// src/pages/CoreTalentsResults.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import talentsData from "../data/coretalents_results_data.json"; // ✅ вернули как было
import rawMapping from "../data/coretalents_question_mapping.json";
import { useNavigate } from "react-router-dom";

// Базовый URL API из переменных окружения
const API_URL = import.meta.env.VITE_API_URL;

export default function CoreTalentsResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Маппинг: question_id -> talent_id
  const mapping: Record<number, number> = {};
  rawMapping.forEach((item) => {
    mapping[item.question_id] = item.talent_id;
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${API_URL}/tests/coretalents/results`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const parsed = res.data.answers || {};

        const validAnswers = Object.entries(parsed)
          .filter(([questionId]) =>
            mapping.hasOwnProperty(Number(questionId))
          )
          .map(([questionId, answer]) => ({
            question_id: Number(questionId),
            answer: Number(answer),
          }));

        const counts: Record<number, number> = {};
        validAnswers.forEach((a: any) => {
          const talentId = mapping[a.question_id];
          counts[talentId] = (counts[talentId] || 0) + (a.answer ?? 0);
        });

        const sorted = Object.entries(counts)
          .map(([talentId, score]) => {
            const id = Number(talentId);
            const talent = talentsData.find((t) => Number(t.id) === id);
            return {
              id,
              name: talent?.name ?? `Талант ${id}`,
              description:
                talent?.description ?? "Описание не найдено",
              details: talent?.details ?? "",
              score,
            };
          })
          .sort((a, b) => b.score - a.score);

        setResults(sorted);
      } catch (err) {
        console.error("❌ Ошибка загрузки результатов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center">Загрузка результатов...</div>
    );

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
            <p className="text-sm text-gray-600 mt-1">
              {res.description}
            </p>
            <p className="text-sm text-gray-800 mt-2">
              {res.details}
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
