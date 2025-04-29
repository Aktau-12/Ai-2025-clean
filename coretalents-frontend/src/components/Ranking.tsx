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
      try {
        const res = await fetch(`${API_URL}/rating/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("401 Unauthorized");
        }

        if (!res.ok) {
          throw new Error(`Ошибка загрузки: ${res.status}`);
        }

        const data = await res.json();
        console.log("🎯 Полученные данные рейтинга:", data);
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

      {loading && <p className="text-center text-gray-600">⏳ Загрузка рейтинга...</p>}
      {error && !loading && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && ranking.length === 0 && (
        <p className="text-center text-gray-500">Нет данных для отображения.</p>
      )}

      {!loading && !error && ranking.length > 0 && (
        <ul className="space-y-4">
          {ranking.map((user, index) => (
            <li
              key={user.user_id}
              className={`flex justify-between items-center bg-white p-4 rounded-xl shadow ${
                index === 0 ? "bg-yellow-100 border-l-4 border-yellow-400" : ""
              }`}
            >
              <div className="text-lg font-semibold">
                #{index + 1} — {user.username || "Аноним"}
              </div>
              <div className="text-sm text-gray-700">
                🎯 {user.xp} XP
              </div>
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
