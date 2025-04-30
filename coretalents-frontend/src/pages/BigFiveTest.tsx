// src/pages/BigFiveTest.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BigFiveResults from "./BigFiveResults";

const API_URL = import.meta.env.VITE_API_URL;

type AnswersMap = Record<number, string>;

enum SubmitState {
  Idle,
  Submitting,
  Done,
}

export default function BigFiveTest() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [current, setCurrent] = useState(0);
  const [timer, setTimer] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/tests/2/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("❌ Ошибка загрузки вопросов:", err));
  }, []);

  useEffect(() => {
    if (!questions.length || submitState !== SubmitState.Idle) return;
    setTimer(20);
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [current, questions, submitState]);

  const getTraitByQuestionId = (id: number): string => {
    const index = (id - 1) % 50;
    if (index < 10) return "O";
    if (index < 20) return "C";
    if (index < 30) return "E";
    if (index < 40) return "A";
    return "N";
  };

  const calculateBigFive = (ans: AnswersMap) => {
    const traits: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const count: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    Object.entries(ans).forEach(([k, v]) => {
      const qId = Number(k);
      const trait = getTraitByQuestionId(qId);
      const num = parseInt(v) || 0;
      traits[trait] += num;
      count[trait] += 1;
    });
    return Object.fromEntries(
      Object.entries(traits).map(([t, sum]) => [t, +(sum / (count[t] || 1)).toFixed(2)])
    );
  };

  const onChange = (id: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const onNext = () => {
    if (current < questions.length - 1) {
      setCurrent((i) => i + 1);
    } else {
      onSubmit();
    }
  };

  const onSubmit = async () => {
    if (submitState !== SubmitState.Idle) return;
    setSubmitState(SubmitState.Submitting);
    const payload = questions.map((q) => ({
      question_id: q.id,
      answer: parseInt(answers[q.id]) || 2,
    }));
    const computed = calculateBigFive(answers);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/tests/2/submit`,
        { answers: payload, result: computed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(computed);
      setSubmitState(SubmitState.Done);
    } catch (err) {
      console.error("❌ Ошибка отправки результатов:", err);
      setSubmitState(SubmitState.Idle);
    }
  };

  if (submitState === SubmitState.Done && result) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Ваши результаты Big Five</h2>
        <BigFiveResults data={result} />
        <div className="mt-6 space-x-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            🔙 Назад в меню
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🚪 Выйти
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return <div className="p-6 text-center">Загрузка...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧠 Big Five Test</h1>

      <div className="flex justify-between text-sm text-gray-600">
        <span>⏳ Осталось: <b>{timer}</b> сек</span>
        <span>Вопрос {current + 1}/{questions.length}</span>
      </div>

      <div className="border p-4 rounded-lg">
        <p className="font-medium mb-4">{current + 1}. {q.text || "(вопрос отсутствует)"}</p>
        <div className="flex justify-around mb-4">
          {[1, 2, 3].map((val) => (
            <label key={val} className="flex flex-col items-center">
              <input
                type="radio"
                name={`q-${q.id}`}
                value={val}
                checked={answers[q.id] === val.toString()}
                onChange={(e) => onChange(q.id, e.target.value)}
                disabled={submitState === SubmitState.Submitting}
              />
              <span className="text-sm mt-1">
                {val === 1 ? "Это не про меня" : val === 2 ? "Не знаю" : "Это точно про меня"}
              </span>
            </label>
          ))}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-orange-500 rounded transition-all"
            style={{ width: `${(timer/20)*100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onSubmit}
          disabled={submitState !== SubmitState.Idle}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          ✅ Завершить тест
        </button>
        {current < questions.length - 1 && (
          <button
            onClick={onNext}
            disabled={submitState !== SubmitState.Idle || answers[q.id] === undefined}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Следующий ➡️
          </button>
        )}
      </div>
    </div>
  );
}
