// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterPage() {
  const [name, setName] = useState(""); // 👤 Имя
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      setError("❗ Пожалуйста, заполните все поля");
      return;
    }
    if (password !== confirm) {
      setError("❗ Пароли не совпадают");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка регистрации");
      }

      const data = await response.json();

      // ✅ Сохраняем токен
      localStorage.setItem("token", data.access_token);

      // 🔀 Перенаправление в дашборд
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      setError(err.message || "Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">📝 Регистрация</h1>

      <input
        type="text"
        placeholder="👤 Ваше имя"
        className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <input
        type="email"
        placeholder="📧 Ваш email"
        className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="🔑 Пароль"
        className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="🔑 Повторите пароль"
        className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        disabled={loading}
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleRegister}
        className={`w-full py-3 rounded font-semibold ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        } text-white transition`}
        disabled={loading}
      >
        {loading ? "⏳ Регистрируем..." : "Зарегистрироваться"}
      </button>

      <p className="text-center mt-6 text-sm">
        Уже есть аккаунт?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Войти
        </a>
      </p>
    </div>
  );
}
