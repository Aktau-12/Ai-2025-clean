import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BigFiveResults from "./BigFiveResults";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export default function BigFiveResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get("${API_URL}/tests/2/result", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Проверка формата данных
        if (
          res.data &&
          typeof res.data === "object" &&
          ["O", "C", "E", "A", "N"].every((key) => key in res.data)
        ) {
          setResult(res.data);
        } else {
          setError("Формат данных некорректен.");
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки результата Big Five:", err);
        setError("Ошибка при загрузке результата.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="p-6 text-center space-y-6">
      <h2 className="text-2xl font-bold">Ваши результаты Big Five</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : result ? (
        <BigFiveResults data={result} />
      ) : (
        <p className="text-red-500">Нет результатов для отображения.</p>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
