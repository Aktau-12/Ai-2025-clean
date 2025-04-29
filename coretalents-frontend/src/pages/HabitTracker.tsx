import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddHabitModal from "@/components/AddHabitModal";
import HabitProgress from "@/components/HabitProgress";

const API_URL = import.meta.env.VITE_API_URL;

interface Habit {
  id: number;
  title: string;
  image_url?: string;
  days: number[];
  done_today: boolean;
  streak: number;
  week_log: boolean[];
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get(`${API_URL}/habits/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(res.data || []);
    } catch (err) {
      console.error("❌ Ошибка при загрузке привычек:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (habitId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.post(
        `${API_URL}/habits/my/${habitId}/check`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === habitId
            ? { ...habit, done_today: true, streak: habit.streak + 1 }
            : habit
        )
      );
    } catch (err) {
      console.error("❌ Ошибка при отметке выполнения привычки:", err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 🔝 Заголовок + кнопка назад */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-800">🔄 Трекер привычек</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-blue-600 hover:underline"
        >
          🔙 В меню
        </button>
      </div>

      {/* 🔁 Как формируются привычки */}
      <div className="mb-10 bg-gray-100 rounded-2xl p-6 shadow">
        <h3 className="text-xl font-semibold mb-4">🔁 Как формируются привычки?</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src="/habit-model.jpeg"
            alt="Цикл привычки"
            className="w-full md:w-1/2 max-h-[300px] object-cover rounded-xl"
          />
          <ul className="text-gray-700 text-sm leading-relaxed space-y-2">
            <li>1️⃣ <b>Триггер</b> — напоминание о действии.</li>
            <li>2️⃣ <b>Действие</b> — выполнение привычки.</li>
            <li>3️⃣ <b>Награда</b> — радость, XP и прогресс.</li>
          </ul>
        </div>
      </div>

      {/* ➕ Кнопка добавить привычку */}
      <div className="text-right mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          ➕ Добавить новую привычку
        </button>
      </div>

      {/* 🧱 Список привычек */}
      {loading ? (
        <p className="text-gray-500 text-center">⏳ Загрузка привычек...</p>
      ) : habits.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <p>😔 У вас пока нет привычек</p>
          <p>Добавьте первую привычку для начала роста!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <img
                src={habit.image_url || "/default-habit.jpg"}
                alt={habit.title}
                className="w-full h-36 object-cover rounded-lg mb-4"
              />
              <h4 className="font-bold text-lg text-blue-700">{habit.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                🔥 Серия: <b>{habit.streak}</b> дней
              </p>

              {/* ✅ Прогресс по неделе */}
              <HabitProgress weekLog={habit.week_log || []} />

              <button
                onClick={() => markAsDone(habit.id)}
                disabled={habit.done_today}
                className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold transition ${
                  habit.done_today
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {habit.done_today ? "✅ Выполнено сегодня" : "✔ Отметить выполнение"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🪄 Модальное окно */}
      <AddHabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={fetchHabits}
      />
    </div>
  );
}
