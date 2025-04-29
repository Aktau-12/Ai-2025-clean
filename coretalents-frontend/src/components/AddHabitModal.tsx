// src/components/AddHabitModal.tsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface HabitTemplate {
  id: number;
  title: string;
  category?: string;
  image_url?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const AddHabitModal = ({ isOpen, onClose, onAdded }: Props) => {
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [days, setDays] = useState<number[]>([]);
  const [custom, setCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  useEffect(() => {
    if (isOpen) fetchTemplates();
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/habits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(res.data);
    } catch (error) {
      console.error("❌ Ошибка загрузки шаблонов привычек:", error);
    }
  };

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addHabit = async () => {
    try {
      const token = localStorage.getItem("token");
      let habitId = selectedHabitId;

      // если пользователь создаёт свою привычку
      if (custom && customTitle.trim() !== "") {
        const res = await axios.post(
          `${API_URL}/habits`,
          { title: customTitle },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        habitId = res.data.habit.id;
      }

      if (!habitId || days.length === 0) return;

      await axios.post(
        `${API_URL}/habits/my`,
        { habit_id: habitId, days },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error("❌ Ошибка добавления привычки:", error);
    }
  };

  const resetForm = () => {
    setSelectedHabitId(null);
    setCustom(false);
    setCustomTitle("");
    setDays([]);
  };

  const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 space-y-6">
        <h2 className="text-lg font-bold">➕ Добавить привычку</h2>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={custom}
              onChange={(e) => setCustom(e.target.checked)}
            />
            <span>Создать свою привычку</span>
          </label>

          {!custom ? (
            <>
              <label className="block mt-4 mb-1 font-medium">Выберите шаблон:</label>
              <select
                value={selectedHabitId ?? ""}
                onChange={(e) => setSelectedHabitId(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">— Выберите —</option>
                {templates.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.title}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="block mt-4 mb-1 font-medium">Название новой привычки:</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Например: Пить воду каждое утро"
                className="w-full border px-3 py-2 rounded"
              />
            </>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">Повторяется в дни недели:</label>
          <div className="flex gap-2 flex-wrap">
            {dayLabels.map((label, index) => (
              <button
                key={index}
                type="button"
                className={`px-3 py-1 rounded-full text-sm border ${
                  days.includes(index)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => toggleDay(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            ❌ Отмена
          </button>
          <button
            onClick={addHabit}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            ➕ Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;
