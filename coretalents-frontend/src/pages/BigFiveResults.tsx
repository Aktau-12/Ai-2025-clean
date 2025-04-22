// src/pages/BigFiveResults.tsx
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

type BigFiveData = {
  [K in "O" | "C" | "E" | "A" | "N"]?: number;
};

interface Props {
  data: BigFiveData;
}

export default function BigFiveResults({ data }: Props) {
  const navigate = useNavigate();

  const traitLabels: Record<keyof BigFiveData, string> = {
    O: "Открытость опыту",
    C: "Сознательность",
    E: "Экстраверсия",
    A: "Доброжелательность",
    N: "Нейротизм",
  };

  const traitDescriptions: Record<keyof BigFiveData, string> = {
    O: "Ты склонен к любопытству, гибкости мышления и богатому воображению. Люди с высокой открытостью стремятся исследовать новое — идеи, эмоции, искусства. Ты видишь глубину в обычных вещах и способен мыслить вне рамок. Такая черта позволяет тебе быть источником вдохновения и генератором перемен.",
    C: "Ты организован, ответственен и внимателен к деталям. Такая черта часто связана с высокой самодисциплиной и стремлением к достижению целей. Ты не бросаешь начатое на полпути и умеешь справляться с долгосрочными задачами, не теряя фокуса.",
    E: "Ты черпаешь энергию из общения и активного взаимодействия с другими. Экстраверты склонны быть яркими, оптимистичными и инициативными. Ты любишь быть в центре событий и чувствуешь себя живым, когда делишься эмоциями с окружающими.",
    A: "Ты стремишься к гармонии и доверительным отношениям. С тобой легко, ты умеешь слушать и поддерживать. Люди с развитой доброжелательностью ценят сотрудничество и заботу, умеют гасить конфликты и создавать атмосферу безопасности.",
    N: "Ты глубоко переживаешь всё, что происходит. Иногда это делает тебя более уязвимым к стрессу, но с другой стороны — ты обладаешь редкой эмпатией. Твоя чувствительность может быть источником искренности, интуиции и художественного восприятия мира.",
  };

  // Если нет валидных числовых данных — сообщаем об этом
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.keys(data).length === 0
  ) {
    return (
      <p className="text-red-500">
        Нет данных для визуализации Big Five.
      </p>
    );
  }

  // Подготавливаем данные для графика
  const chartData = (Object.keys(data) as (keyof BigFiveData)[])
    .filter((t) => typeof data[t] === "number" && !isNaN(data[t]!))
    .map((trait) => ({
      trait,
      label: traitLabels[trait],
      value: data[trait]!,
      description: traitDescriptions[trait],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="mt-6 space-y-10">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          🔍 Визуализация результатов
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={chartData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis domain={[1, 5]} />
            <Tooltip />
            <Radar
              name="Вы"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          🧠 Описание ваших черт личности:
        </h3>
        {chartData.map((trait, idx) => (
          <div
            key={trait.trait}
            className="p-4 border rounded-lg bg-white shadow"
          >
            <h4 className="text-purple-700 font-bold text-md mb-2">
              {idx + 1}. {trait.label}
            </h4>
            <p className="text-gray-700">
              {trait.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
        >
          🔙 В меню
        </button>
      </div>
    </div>
  );
}
