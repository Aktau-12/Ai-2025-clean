// src/pages/CoreTalentsResults.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function CoreTalentsTest() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/coretalents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => {
        console.error("❌ Ошибка загрузки вопросов:", err);
      });
  }, []);

  const handleAnswer = (value: number) => {
    const q = questions[current];
    if (!q) return;

    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      handleSubmit(updated);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await axios.post(
        `${API_URL}/tests/1/submit`,
        { answers: data },
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
    navigate("/coretalents/results");
    return null;
  }

  const q = questions[current];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-blue-900">
        CoreTalents — Вопрос {current + 1} из {questions.length}
      </h1>

      {q && (
        <>
          <div className="text-lg font-semibold text-gray-700">
            A: {q.question_a}
          </div>
          <div className="text-lg font-semibold text-gray-700">
            B: {q.question_b}
          </div>

          <div className="grid grid-cols-5 gap-4 mt-6">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => handleAnswer(val)}
                className="btn-primary"
              >
                {val}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
