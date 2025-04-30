// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroPath from "../components/HeroPath";
import Ranking from "../components/Ranking";
import HeroProfessions from "../components/HeroProfessions";
import HabitTracker from "./HabitTracker";
import ThinkingAlgorithm from "../components/ThinkingAlgorithm";
import LifeWheel from "../components/LifeWheel";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [tab, setTab] = useState("menu");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/tests/my-results`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([userRes, resultsRes]) => {
        if (!userRes.ok || !resultsRes.ok) throw new Error("Ошибка загрузки данных");
        const userData = await userRes.json();
        const resultsData = await resultsRes.json();

        setEmail(userData.email);
        setName(userData.name || userData.email);
        setMbtiType(userData.mbti_type || null);
        setResults(resultsData);
      })
      .catch((err) => {
        console.error("Ошибка загрузки:", err);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const tabs = [
    { key: "tests", label: "💡 Мои тесты", description: "Пройти тесты", color: "bg-yellow-100 text-yellow-800" },
    { key: "results", label: "📈 Результаты", description: "История и аналитика", color: "bg-blue-100 text-blue-800" },
    { key: "hero", label: "🗺️ Путь героя", description: "Ваш путь развития", color: "bg-green-100 text-green-800" },
    { key: "mentor", label: "🧙‍♂️ AI-наставник", description: "Персональные советы", color: "bg-indigo-100 text-indigo-800" },
    { key: "professions", label: "💼 Профессии", description: "Рекомендации профессий", color: "bg-pink-100 text-pink-800" },
    { key: "ranking", label: "🏆 Рейтинг", description: "Топ пользователей", color: "bg-red-100 text-red-800" },
    { key: "habits", label: "🔄 Привычки", description: "Трекер привычек", color: "bg-teal-100 text-teal-800" },
    { key: "thinking", label: "🧠 Алгоритм мышления", description: "Стратегии мышления", color: "bg-purple-100 text-purple-800" },
    { key: "lifewheel", label: "📊 Колесо жизни", description: "Баланс жизни", color: "bg-orange-100 text-orange-800" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-2">
          Добро пожаловать в Проект-Я, {name || email}!
        </h1>
        {email && (
          <p className="text-center text-gray-600 mb-10">
            Вы вошли как <strong>{email}</strong>
          </p>
        )}

        {tab === "menu" && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-2xl p-6 shadow-md flex flex-col items-center text-center transition transform hover:scale-105 hover:shadow-xl ${t.color}`}
              >
                <div className="text-4xl mb-2">{t.label}</div>
                <p className="text-sm">{t.description}</p>
              </button>
            ))}
          </div>
        )}

        {tab === "tests" && (
          <div className="flex flex-col items-center space-y-4 mt-10">
            <button onClick={() => navigate("/coretalents")} className="btn-primary">
              CoreTalents 34
            </button>
            <button onClick={() => navigate("/bigfive")} className="btn-primary">
              Big Five
            </button>
            <button onClick={() => navigate("/mbti")} className="btn-primary">
              MBTI
            </button>
            <button onClick={() => setTab("menu")} className="btn-outline mt-4">
              🔙 Назад в меню
            </button>
          </div>
        )}

        {tab === "results" && (
          <div className="space-y-6 mt-8">
            {mbtiType && (
              <div className="flex items-center justify-center gap-4">
                <img
                  src={`/mbti-avatars/${mbtiType}.png`}
                  alt={mbtiType}
                  className="w-12 h-12 rounded-full border"
                />
                <p className="text-blue-700 font-semibold">Ваш MBTI тип: {mbtiType}</p>
              </div>
            )}
            <h3 className="text-xl font-semibold text-center">История прохождения тестов</h3>
            {results.length === 0 ? (
              <p className="text-center text-gray-500">Нет пройденных тестов.</p>
            ) : (
              results.map((res, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow">
                  <p className="text-sm font-medium">
                    🧪 {res.test_name} — {new Date(res.completed_at).toLocaleString()}
                  </p>
                  {res.summary && (
                    <p className="text-sm text-gray-700 mt-1">{res.summary}</p>
                  )}
                  {res.test_name === "CoreTalents 34" && (
                    <button onClick={() => navigate("/coretalents-results")} className="btn-primary mt-2">
                      🔎 Посмотреть 34 таланта
                    </button>
                  )}
                  {res.test_name === "Big Five" && (
                    <button onClick={() => navigate("/bigfive-results")} className="btn-primary mt-2">
                      🔎 Посмотреть Big Five
                    </button>
                  )}
                  {res.test_name === "MBTI" && (
                    <button onClick={() => navigate("/mbti-results")} className="btn-primary mt-2">
                      🔎 Посмотреть MBTI
                    </button>
                  )}
                </div>
              ))
            )}
            <div className="text-center">
              <button onClick={() => setTab("menu")} className="btn-outline mt-6">
                🔙 Назад в меню
              </button>
            </div>
          </div>
        )}

        {tab === "hero" && (
          <div className="mt-8">
            <HeroPath />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </div>
        )}

        {tab === "professions" && (
          <div className="mt-8">
            <HeroProfessions />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </div>
        )}

        {tab === "ranking" && (
          <div className="mt-8">
            <Ranking />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </div>
        )}

        {tab === "habits" && (
          <div className="mt-8">
            <HabitTracker />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </div>
        )}

        {tab === "thinking" && (
          <div className="mt-8">
            <ThinkingAlgorithm />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </div>
        )}

        {tab === "lifewheel" && (
          <div className="mt-8">
            <LifeWheel />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </div>
        )}

        <div className="text-center pt-10">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl"
          >
            🚪 Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
