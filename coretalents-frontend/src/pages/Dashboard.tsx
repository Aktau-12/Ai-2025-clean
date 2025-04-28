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

    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Не удалось получить пользователя");
        const data = await res.json();
        setEmail(data.email);
        setName(data.name || data.email);
        setMbtiType(data.mbti_type || null);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

    fetch(`${API_URL}/tests/my-results`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка загрузки результатов");
        const data = await res.json();
        setResults(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [navigate]);

  const tabs = [
    { key: "tests", label: "🧠 Мои тесты" },
    { key: "results", label: "📊 Результаты" },
    { key: "hero", label: "🛤 Путь героя" },
    { key: "mentor", label: "🤖 AI‑наставник" },
    { key: "professions", label: "🧭 Профессии" },
    { key: "ranking", label: "🏆 Рейтинг" },
    { key: "habits", label: "💡 Привычки" },
    { key: "thinking", label: "🧠 Алгоритм мышления" },
    { key: "lifewheel", label: "📈 Колесо жизни" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-800">
        📊 Добро пожаловать в Проект-Я, {name || email}!
      </h1>
      {email && (
        <p className="text-center text-gray-600">
          Вы вошли как <strong>{email}</strong>
        </p>
      )}

      {tab === "menu" && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center hover:bg-blue-50"
            >
              <span className="text-2xl mb-2">{t.label}</span>
              <span className="text-sm text-gray-500">
                {t.key === "tests"
                  ? "Пройти психологические тесты"
                  : t.key === "hero"
                  ? "Ваш путь развития"
                  : t.key === "mentor"
                  ? "AI-наставник с советами"
                  : t.key === "lifewheel"
                  ? "Оценка сфер жизни"
                  : "Дополнительный модуль"}
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === "tests" && (
        <div className="space-y-4">
          <button onClick={() => navigate("/coretalents")} className="btn-primary">
            CoreTalents 34
          </button>
          <button onClick={() => navigate("/bigfive")} className="btn-primary">
            Big Five
          </button>
          <button onClick={() => navigate("/mbti")} className="btn-primary">
            MBTI
          </button>
          <button onClick={() => setTab("menu")} className="btn-outline">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-4">
          {mbtiType && (
            <div className="flex items-center justify-center gap-4">
              <img
                src={`/mbti-avatars/${mbtiType}.png`}
                alt={mbtiType}
                className="w-12 h-12 rounded-full border"
              />
              <p className="text-blue-700 font-semibold">🧬 Ваш MBTI тип: {mbtiType}</p>
            </div>
          )}
          <h3 className="font-semibold">📜 История прохождения:</h3>
          {results.map((res, idx) => (
            <div key={idx} className="bg-gray-100 rounded p-4">
              <p className="text-sm font-medium">
                🧪 {res.test_name} — {new Date(res.completed_at).toLocaleString()}
              </p>
              {res.summary && <p className="text-sm text-gray-700 mt-1">{res.summary}</p>}

              {/* 🔥 Добавлено: если CoreTalents 34 — показать кнопку перехода */}
              {res.test_name === "CoreTalents 34" && (
                <button
                  onClick={() => navigate("/coretalents-results")}
                  className="btn-primary mt-2"
                >
                  🔎 Посмотреть все 34 таланта
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setTab("menu")} className="btn-outline">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "hero" && (
        <div className="space-y-4">
          <HeroPath />
          <button onClick={() => setTab("menu")} className="btn-outline">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "mentor" && (
        <div className="space-y-2 text-sm">
          <p>🎓 Вот персональные рекомендации:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Записывай идеи каждый день.</li>
            <li>Сфокусируйся на одном проекте хотя бы на неделю.</li>
            <li>Сделай первые 3 шага — это заложит фундамент.</li>
          </ul>
          <button onClick={() => setTab("menu")} className="btn-outline">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "professions" && (
        <div>
          <HeroProfessions />
          <button onClick={() => setTab("menu")} className="btn-outline mt-4">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "ranking" && (
        <div>
          <Ranking />
          <button onClick={() => setTab("menu")} className="btn-outline mt-4">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "habits" && (
        <div>
          <HabitTracker />
          <button onClick={() => setTab("menu")} className="btn-outline mt-4">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "thinking" && (
        <div>
          <ThinkingAlgorithm />
          <button onClick={() => setTab("menu")} className="btn-outline mt-4">
            🔙 Назад в меню
          </button>
        </div>
      )}

      {tab === "lifewheel" && (
        <div>
          <LifeWheel />
          <button onClick={() => setTab("menu")} className="btn-outline mt-4">
            🔙 Назад в меню
          </button>
        </div>
      )}

      <div className="text-center pt-8">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  );
}
