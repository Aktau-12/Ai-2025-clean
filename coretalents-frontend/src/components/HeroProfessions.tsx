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
        const response = await axios.get("${API_URL}/hero/professions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfessions(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке профессий:", error);
        setError("Не удалось загрузить список профессий.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  if (loading) return <p>⏳ Загружаем профессии...</p>;
  if (error) return <p className="text-red-500">❌ {error}</p>;
  if (professions.length === 0) return <p>😕 Пока нет подходящих профессий</p>;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-3">🎯 Подходящие профессии</h2>
      <ul className="space-y-4">
        {professions.map((p) => (
          <li key={p.name} className="border-l-4 border-blue-500 pl-3">
            <div className="text-lg font-semibold">{p.emoji} {p.name}</div>
            <div className="text-sm text-gray-500 italic">{p.original_title}</div>
            <p className="text-sm text-gray-700 mt-1">{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeroProfessions;
