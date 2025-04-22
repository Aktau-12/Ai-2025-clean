// src/pages/CoreTalentsTest.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CoreTalentsResults from "../pages/CoreTalentsResults";

const API_URL = import.meta.env.VITE_API_URL;

export default function CoreTalentsTest() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(20);
  const navigate = useNavigate();

  // Загрузка вопросов
  useEffect(() => {
    axios
      .get(`${API_URL}/tests/1/questions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setQuestions(res.data))
      .catch((error) => console.error("❌ Ошибка загрузки вопросов:", error));
  }, [navigate]);

  // Таймер на вопрос
  useEffect(() => {
    if (!questions.length) return;
    setTimer(20);
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleAutoNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [current, questions]);

  const handleSelect = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAutoNext = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${API_URL}/tests/1/submit`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSubmitted(true);
    } catch (error) {
      console.error("❌ Ошибка при отправке:", error);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">
          🧠 Ваши сильные стороны по CoreTalents
        </h2>
        <CoreTalentsResults />
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded"
          >
            🔙 Назад в меню
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded"
          >
            🚪 Выйти
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return <div className="p-6 text-center">Загрузка...</div>;

  const progress = ((current + 1) / questions.length) * 100;

  const labels: Record<number, string> = {
    [-2]: "Полностью согласен",
    [-1]: "Частично согласен",
    [0]: "Согласен с обоими",
    [1]: "Частично согласен",
    [2]: "Полностью согласен",
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">
          Вопрос {current + 1} / {questions.length}
        </span>
        <span className="text-sm text-gray-600">
          Прогресс: {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center text-sm text-gray-500 mb-2">
        ⏳ Осталось: <span className="font-bold">{timer}</span> сек.
      </div>

      <div className="border p-6 rounded-xl shadow space-y-6">
        <div className="flex justify-between w-full text-lg font-medium">
          <div className="w-1/2 text-left">{q.question_a}</div>
          <div className="w-1/2 text-right">{q.question_b}</div>
        </div>

        <div className="flex justify-between w-full mt-2">
          {[-2, -1, 0, 1, 2].map((val) => (
            <label
              key={val}
              className="flex flex-col items-center text-sm w-1/5 cursor-pointer"
            >
              <input
                type="radio"
                name={`question-${q.position}`}
                value={val}
                checked={answers[q.position] === val}
                onChange={() => handleSelect(q.position, val)}
                className="mb-1"
              />
              {labels[val]}
            </label>
          ))}
        </div>

        {/* Прогресс-бар таймера */}
        <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
            style={{ width: `${(timer / 20) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ✅ Завершить тест
        </button>

        {answers[q.position] !== undefined && current < questions.length - 1 && (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Следующий ➡️
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          🔙 Выйти в меню
        </button>
      </div>
    </div>
  );
}
