// src/components/LifeWheel.tsx
import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

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

  const handleChange = (index: number, value: number) => {
    const newData = [...data];
    newData[index].value = value;
    setData(newData);
  };

  const handleSave = () => {
    alert("🎉 Ваше колесо жизни сохранено локально! (пока без сервера)");
    // Здесь в будущем можно сделать сохранение на сервер через axios
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
            <p className="text-sm text-gray-500">Уровень: <b>{item.value}</b> из 10</p>
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
      <div className="text-center">
        <button
          onClick={handleSave}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow"
        >
          💾 Сохранить результаты
        </button>
      </div>
    </div>
  );
}
