// src/pages/Ranking.tsx
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Вы не авторизованы");
      setLoading(false);
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/rating/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔑 Важно!
      },
      cache: "no-store",
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("401 Unauthorized");
        }
        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status}`);
        }
        const data = await res.json();
        console.log("🎯 Полученные данные рейтинга:", data);
        setRanking(data);
      })
      .catch((err) => {
        console.error("Ошибка загрузки рейтинга:", err);
        setError("Не удалось загрузить рейтинг. Возможно, вы не авторизованы.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">🏆 Рейтинг пользователей по XP</h1>

      {loading && <p className="text-gray-500 text-center">⏳ Загрузка...</p>}
      {error && !loading && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-3">
          {ranking.length === 0 ? (
            <p className="text-gray-500 text-center">Нет данных для отображения.</p>
          ) : (
            ranking.map((user, index) => (
              <li
                key={user.user_id}
                className={`bg-white p-4 rounded shadow flex justify-between ${
                  index === 0 ? "font-bold text-purple-600" : ""
                }`}
              >
                <span>
                  #{index + 1} — <strong>{user.username}</strong>
                </span>
                <span>🎯 {user.xp} XP</span>
              </li>
            ))
          )}
        </ul>
      )}

      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          🔙 Назад в меню
        </button>
      </div>
    </div>
  );
}
