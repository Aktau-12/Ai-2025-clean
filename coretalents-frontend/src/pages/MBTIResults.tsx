// src/pages/MBTIResults.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface MBTIResult {
  type_code: string;
  description: string;
  extended_description?: string;
  details?: Record<string, number>;
}

export default function MBTIResults() {
  const [result, setResult] = useState<MBTIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get<MBTIResult>(`${API_URL}/mbti/me/result`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🎯 MBTI результат получен:", res.data);
        setResult(res.data);
      } catch (err: any) {
        console.error("❌ Ошибка загрузки MBTI:", err.response?.data || err.message);
        if (err.response?.status === 404) {
          setError("Вы ещё не проходили MBTI тест. Перенаправляем на тест...");
          setTimeout(() => navigate("/mbti"), 3000);
        } else {
          setError("Ошибка при загрузке результатов. Попробуйте позже.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [navigate]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">⏳ Загрузка результата MBTI...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 space-y-4">
        <p>{error}</p>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
          >
            🔙 Назад в меню
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

  if (!result) {
    return (
      <div className="p-6 text-center text-gray-500">
        Нет данных для отображения MBTI.
      </div>
    );
  }

  const avatarUrl = `/mbti-avatars/${result.type_code}.png`;

  const sortedDetails = result.details
    ? Object.entries(result.details).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="p-6 max-w-2xl mx-auto mt-10 border rounded-xl shadow text-center space-y-6 bg-white">
      <h2 className="text-2xl font-bold">🎉 Ваш результат MBTI</h2>

      <div className="flex justify-center">
        <img
          src={avatarUrl}
          onError={(e) => (e.currentTarget.src = "/mbti-avatars/default.png")}
          alt={result.type_code}
          className="w-40 h-40 object-contain mb-4 transition-opacity duration-700 opacity-0"
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        />
      </div>

      <h3 className="text-xl font-semibold">
        Тип:{" "}
        <span className="text-blue-600 text-3xl font-bold">
          {result.type_code}
        </span>{" "}
        — {result.description}
      </h3>

      {result.extended_description && (
        <div className="text-left border-t pt-4">
          <h4 className="text-lg font-semibold mb-2 text-gray-800">📖 Описание:</h4>
          <p className="text-gray-700 whitespace-pre-line">{result.extended_description}</p>
        </div>
      )}

      {sortedDetails.length > 0 && (
        <div className="text-left bg-gray-50 border rounded-lg p-4 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">🧮 Баллы по шкалам:</h4>
          <ul className="grid grid-cols-2 gap-2">
            {sortedDetails.map(([trait, value]) => (
              <li key={trait}>
                <strong>{trait}</strong>: {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
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
