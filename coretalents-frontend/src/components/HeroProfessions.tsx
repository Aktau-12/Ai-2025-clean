import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface Profession {
  name: string;
  original_title: string;
  description: string;
  emoji: string;
}

const HeroProfessions: React.FC = () => {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Пользователь не авторизован.");

        const response = await axios.get(`${API_URL}/hero/professions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Ответ от сервера не является массивом.");
        }

        setProfessions(response.data);
      } catch (error: any) {
        console.error("❌ Ошибка при загрузке профессий:", error);
        if (error.response?.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Не удалось загрузить список профессий. Проверьте подключение.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        ⏳ Загружаем подборку профессий...
      </div>
    );
  }

  if (error) {
    if (error.includes("Профиль пользователя неполный")) {
      return (
        <div className="p-6 text-center text-red-500 space-y-2">
          🔥 Чтобы увидеть подборку профессий, пожалуйста, пройдите все 3 теста:
          <br />
          <strong>CoreTalents, Big Five и MBTI!</strong>
        </div>
      );
    }
    return (
      <div className="p-6 text-center text-red-500">
        ❌ {error}
      </div>
    );
  }

  if (professions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        😕 Пока нет подходящих профессий для отображения.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
        🎯 Подходящие профессии
      </h2>

      <ul className="space-y-6">
        {professions.map((p) => (
          <li
            key={p.name}
            className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-lg"
          >
            <div className="text-lg font-semibold">
              {p.emoji} {p.name}
            </div>
            <div className="text-sm text-gray-500 italic">{p.original_title}</div>
            <p className="text-sm text-gray-700 mt-1">{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeroProfessions;
