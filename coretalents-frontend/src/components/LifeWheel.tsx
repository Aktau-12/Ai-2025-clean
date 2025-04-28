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

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">📈 Колесо жизни</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col space-y-2">
            <label className="font-semibold">{item.subject}</label>
            <input
              type="range"
              min={0}
              max={10}
              value={item.value}
              onChange={(e) => handleChange(idx, Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600">Текущий уровень: {item.value}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar
              dataKey="value"
              stroke="#4f46e5"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center">
        <button
          onClick={() => alert("🎉 Ваше колесо жизни сохранено (пока локально)!")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
        >
          💾 Сохранить результаты
        </button>
      </div>
    </div>
  );
}
