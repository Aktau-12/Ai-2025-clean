// src/components/LifeWheel.tsx
import React, { useState } from "react";
import axios from "axios";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

const initialData = [
  { subject: "Здоровье", value: 6 },
  { subject: "Карьера", value: 7 },
  { subject: "Финансы", value: 5 },
  { subject: "Отношения", value: 4 },
  { subject: "Личностный рост", value: 8 },
  { subject: "Окружение", value: 6 },
  { subject: "Досуг", value: 5 },
  { subject: "Духовность", value: 3 },
];

export default function LifeWheel() {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (index: number, value: number) => {
    const newData = [...data];
    newData[index].value = value;
    setData(newData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("⛔ Нет токена. Пожалуйста, войдите снова.");
        return;
      }

      const lifeWheelData = data.reduce((acc, item) => {
        acc[item.subject] = item.value;
        return acc;
      }, {} as Record<string, number>);

      await axios.post(
        `${API_URL}/life-wheel/save`,
        { scores: lifeWheelData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Ваше колесо жизни успешно сохранено!");
    } catch (err: any) {
      console.error("Ошибка при сохранении колеса:", err);
      setMessage("❌ Ошибка при сохранении. Попробуйте позже.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center text-blue-800">📈 Колесо жизни</h2>

      {/* Блок с ползунками */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col space-y-2">
            <label className="font-semibold text-gray-700">{item.subject}</label>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={item.value}
              onChange={(e) => handleChange(idx, Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-sm text-gray-500">
              Уровень: <b>{item.value}</b> из 10
            </p>
          </div>
        ))}
      </div>

      {/* Блок с графиком */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar
              name="Ваше колесо жизни"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Кнопка сохранить */}
      <div className="text-center space-y-4">
        {message && <div className="text-sm font-semibold text-gray-700">{message}</div>}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "⏳ Сохранение..." : "💾 Сохранить результаты"}
        </button>
      </div>
    </div>
  );
}
