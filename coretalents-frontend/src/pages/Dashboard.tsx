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
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8">
              {[
                { key: "tests", icon: "💡", title: "Мои тесты", subtitle: "Пройти психологические тесты" },
                { key: "results", icon: "📊", title: "Результаты", subtitle: "Ваши результаты тестов" },
                { key: "hero", icon: "🗺️", title: "Путь героя", subtitle: "Ваш путь развития" },
                { key: "mentor", icon: "🤖", title: "AI-наставник", subtitle: "Советы от AI" },
                { key: "professions", icon: "🎯", title: "Профессии", subtitle: "Рекомендации профессий" },
                { key: "lifewheel", icon: "📈", title: "Колесо жизни", subtitle: "Баланс жизненных сфер" },
                { key: "ranking", icon: "🏆", title: "Рейтинг", subtitle: "Топ пользователей по XP" },
                { key: "habits", icon: "✅", title: "Привычки", subtitle: "Трекер привычек" },
                { key: "thinking", icon: "🧠", title: "Алгоритмы мышления", subtitle: "Инструменты мышления" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-start text-left hover:bg-blue-50"
                >
                  <div className="text-4xl">{item.icon}</div>
                  <div className="text-lg font-semibold mt-2">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.subtitle}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow transition"
              >
                🚪 Выйти
              </button>
            </div>
          </>
        )}

        {/* Мои тесты */}
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

        {/* История результатов */}
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
                  {res.summary && <p className="text-sm text-gray-700 mt-1">{res.summary}</p>}
                  {res.test_name === "CoreTalents 34" && (
                    <button
                      onClick={() => navigate("/coretalents/results")}
                      className="btn-primary mt-2"
                    >
                      🔎 Посмотреть 34 талента
                    </button>
                  )}
                  {res.test_name === "Big Five" && (
                    <button
                      onClick={() => navigate("/bigfive/results")}
                      className="btn-primary mt-2"
                    >
                      🔎 Посмотреть Big Five
                    </button>
                  )}
                  {res.test_name === "MBTI" && (
                    <button
                      onClick={() => navigate("/mbti/results")}
                      className="btn-primary mt-2"
                    >
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

        {/* Остальные вкладки */}
        {tab === "hero" && (
          <section className="mt-8">
            <HeroPath />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </section>
        )}
        {tab === "professions" && (
          <section className="mt-8">
            <HeroProfessions />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </section>
        )}
        {tab === "ranking" && (
          <section className="mt-8">
            <Ranking />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </section>
        )}
        {tab === "habits" && (
          <section className="mt-8">
            <HabitTracker />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </section>
        )}
        {tab === "thinking" && (
          <section className="mt-8">
            <ThinkingAlgorithm />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </section>
        )}
        {tab === "lifewheel" && (
          <section className="mt-8">
            <LifeWheel />
            <button onClick={() => setTab("menu")} className="btn-outline mt-6">
              🔙 Назад в меню
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
