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

const MBTITest = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerPayloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("${API_URL}/mbti/questions")
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке вопросов MBTI:", err);
        setLoading(false);
      });
  }, []);

  const handleAnswer = (choice: number) => {
    const question = questions[currentIndex];
    let answer = "";
    if (choice === 1) answer = question.trait_a;
    else if (choice === 2) answer = question.trait_b;
    else if (choice === 4 || choice === 0) answer = "X";

    const newAnswer: AnswerPayloadItem = {
      question_id: question.id,
      answer: answer,
      trait_a: question.trait_a,
      trait_b: question.trait_b,
    };

    const newAnswers = [...answers];
    newAnswers[currentIndex] = newAnswer;
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "${API_URL}/mbti/submit",
        { answers: answers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => navigate("/mbti/results"))
      .catch((err) => {
        console.error("Ошибка при отправке MBTI:", err);
        alert("Ошибка отправки данных. Попробуйте ещё раз.");
      });
  };

  if (loading) return <div className="p-6">📦 Загрузка...</div>;
  if (!questions.length) return <div className="p-6">❌ Вопросы не найдены</div>;

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🧠 MBTI-тест</h2>
        <p>
          Вопрос {currentIndex + 1} из {questions.length} | ⏱️ {progress.toFixed(1)}%
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <p className="mb-2 font-medium text-center">A: {question.question_a}</p>
        <p className="mb-4 font-medium text-center">B: {question.question_b}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAnswer(1)}
            className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            🅰 Согласен с A
          </button>
          <button
            onClick={() => handleAnswer(4)}
            className="bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600"
          >
            🔁 Согласен с обоими
          </button>
          <button
            onClick={() => handleAnswer(0)}
            className="bg-gray-500 text-white py-2 rounded-xl hover:bg-gray-600 col-span-2"
          >
            ❌ Ни один из вариантов
          </button>
          <button
            onClick={() => handleAnswer(2)}
            className="bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
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
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ✅ Завершить тест
          </button>
        )}
      </div>
    </div>
  );
};

export default MBTITest;
