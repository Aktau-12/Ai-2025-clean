// src/pages/MBTITest.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  id: number;
  question_a: string;
  question_b: string;
  trait_a: string;
  trait_b: string;
}

interface AnswerPayloadItem {
  question_id: number;
  answer: string;
  trait_a: string;
  trait_b: string;
}

export default function MBTITest() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerPayloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<Question[]>(`${API_URL}/mbti/questions`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Ошибка при загрузке вопросов MBTI:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = async (choice: number) => {
    const q = questions[currentIndex];
    const answerStr =
      choice === 1 ? q.trait_a :
      choice === 2 ? q.trait_b :
      "X";

    // собираем новый массив с ответами
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      question_id: q.id,
      answer: answerStr,
      trait_a: q.trait_a,
      trait_b: q.trait_b,
    };
    setAnswers(newAnswers);

    const isLast = currentIndex === questions.length - 1;
    if (isLast) {
      await handleSubmit(newAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSubmit = async (finalAnswers: AnswerPayloadItem[] = answers) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/mbti/submit`,
        { answers: finalAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/mbti/results");
    } catch (err) {
      console.error("Ошибка при отправке MBTI:", err);
      alert("❌ Ошибка отправки данных. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">📦 Загрузка...</div>;
  if (!questions.length)
    return <div className="p-6 text-center">❌ Вопросы не найдены</div>;

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🧠 MBTI-тест</h2>
        <p>
          Вопрос {currentIndex + 1} из {questions.length} —{" "}
          <span className="font-mono">{progress.toFixed(1)}%</span>
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <p className="mb-2 font-medium text-center">A: {q.question_a}</p>
        <p className="mb-4 font-medium text-center">B: {q.question_b}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAnswer(1)}
            disabled={submitting}
            className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            🅰 Согласен с A
          </button>
          <button
            onClick={() => handleAnswer(4)}
            disabled={submitting}
            className="bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600 disabled:opacity-50"
          >
            🔁 Согласен с обоими
          </button>
          <button
            onClick={() => handleAnswer(0)}
            disabled={submitting}
            className="bg-gray-500 text-white py-2 rounded-xl col-span-2 hover:bg-gray-600 disabled:opacity-50"
          >
            ❌ Ни один
          </button>
          <button
            onClick={() => handleAnswer(2)}
            disabled={submitting}
            className="bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            🅱 Согласен с B
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          🔙 Выйти в меню
        </button>

        {currentIndex === questions.length - 1 && (
          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "⏳ Завершаем..." : "✅ Завершить тест"}
          </button>
        )}
      </div>
    </div>
  );
}
