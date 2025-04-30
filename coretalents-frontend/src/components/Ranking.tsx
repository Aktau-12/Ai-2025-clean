import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface RatingUser {
  user_id: number;
  username: string;
  xp: number;
}

export default function Ranking() {
  const navigate = useNavigate();
  const [data, setData] = useState<RatingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❗ Необходимо войти в систему");
        setLoading(false);
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/rating`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          // Неавторизованный
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Ошибка загрузки рейтинга: ${res.status}`);
        }

        const json: RatingUser[] = await res.json();
        setData(json);
      } catch (e: any) {
        console.error("Ошибка при загрузке рейтинга:", e);
        setError(e.message || "Не удалось загрузить рейтинг");
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [navigate]);

  if (loading) {
    return <div className="text-center py-4">⏳ Загрузка рейтинга...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">❌ {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">🏆 Топ пользователей</h2>
      {data.length === 0 ? (
        <p className="text-center text-gray-500">Нет данных для отображения.</p>
      ) : (
        <ul className="divide-y">
          {data.map((u, idx) => (
            <li key={u.user_id} className="flex justify-between py-2">
              <span>{idx + 1}. {u.username || 'Аноним'}</span>
              <span>{u.xp} XP</span>
            </li>
          ))}
        </ul>
      )}
      <div className="text-center mt-6">
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
