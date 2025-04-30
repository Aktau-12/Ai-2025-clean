import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type RankedUser = {
  user_id: number;
  username: string;
  xp: number;
};

export default function Ranking() {
  const [ranking, setRanking] = useState<RankedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Вы не авторизованы. Пожалуйста, войдите снова.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchRanking = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/rating`, {  // убрал конечный слэш
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Ошибка загрузки: ${res.status}`);
        }

        const data: RankedUser[] = await res.json();
        setRanking(data);
      } catch (err: any) {
        console.error("❌ Ошибка загрузки рейтинга:", err);
        setError("Не удалось загрузить рейтинг. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [navigate]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">
        🏆 Рейтинг пользователей по XP
      </h1>

      {loading && (
        <p className="text-center text-gray-600">⏳ Загрузка рейтинга...</p>
      )}

      {!loading && error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && ranking.length === 0 && (
        <p className="text-center text-gray-500">Нет данных для отображения.</p>
      )}

      {!loading && !error && ranking.length > 0 && (
        <ul className="space-y-4">
          {ranking.map((user, idx) => (
            <li
              key={user.user_id}
              className={`flex justify-between items-center bg-white p-4 rounded-xl shadow ${
                idx === 0 ? "bg-yellow-100 border-l-4 border-yellow-400" : ""
              }`}
            >
              <span className="text-lg font-semibold">
                #{idx + 1} — {user.username || "Аноним"}
              </span>
              <span className="text-sm text-gray-700">🎯 {user.xp} XP</span>
            </li>
          ))}
        </ul>
      )}

      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition"
        >
          🔙 Назад в меню
        </button>
      </div>
    </div>
  );
}
