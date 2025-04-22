// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Базовый URL API из переменных окружения
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Введите почту и пароль");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("Сервер временно недоступен. Повторите позже.");
        }
        throw new Error("Неверный логин или пароль");
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("Ошибка авторизации: токен не получен");
      }

      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Ошибка входа:", err);
      setError(err.message || "Произошла ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">🔐 Вход в аккаунт</h1>

      <input
        type="email"
        placeholder="Почта"
        className="w-full mb-3 p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <button
        onClick={handleLogin}
        className={`w-full py-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
        disabled={loading}
      >
        {loading ? "⏳ Входим..." : "Войти"}
      </button>

      <p className="text-center mt-4 text-sm">
        Нет аккаунта?{' '}
        <a href="/register" className="text-blue-600 underline">
          Зарегистрироваться
        </a>
      </p>
    </div>
  );
}
