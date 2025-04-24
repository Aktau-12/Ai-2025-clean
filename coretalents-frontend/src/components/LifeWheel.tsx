// src/components/LifeWheel.tsx
import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";

const data = [
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
  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
