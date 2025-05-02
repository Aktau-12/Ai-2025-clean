// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("❗ Введите почту и пароль");
      return;
    }
    if (!validateEmail(email)) {
      setError("❗ Неверный формат почты");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("🚨 Сервер недоступен. Попробуйте позже.");
        }
        if (response.status === 401) {
          throw new Error("❌ Неверный логин или пароль");
        }
        throw new Error("❗ Ошибка входа");
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("❗ Токен авторизации не получен");
      }

      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Ошибка входа:", err);
      setError(err.message || "❗ Произошла ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-md bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">🔐 Вход в аккаунт</h1>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="📧 Ваша почта"
          className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="🔑 Ваш пароль"
          className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded font-bold text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "⏳ Входим..." : "Войти"}
        </button>

        <p className="text-center text-sm mt-4 text-gray-600">
          Нет аккаунта?{" "}
          <button
            onClick={goToRegister}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}

