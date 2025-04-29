// src/pages/LoginRegister.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginRegister() {
  const [tab, setTab] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("❗ Введите почту и пароль для входа");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Ошибка входа:", err);
      setError("❌ Неверная почта или пароль");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerEmail || !registerPassword) {
      setError("❗ Введите почту и пароль для регистрации");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: registerEmail,
        password: registerPassword,
      });

      alert("🎉 Успешная регистрация! Теперь войдите в аккаунт.");
      setRegisterEmail("");
      setRegisterPassword("");
      setTab("login"); // 👈 Переключение на вход
    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      setError("❗ Ошибка регистрации. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-xl bg-white">
      <Tabs value={tab} onValueChange={(val) => setTab(val as "login" | "register")}>
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="login">🔐 Вход</TabsTrigger>
          <TabsTrigger value="register">📝 Регистрация</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Input
            placeholder="📧 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="🔑 Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            disabled={loading}
          />

          {error && tab === "login" && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleLogin} className="w-full" disabled={loading}>
            {loading ? "⏳ Входим..." : "Войти"}
          </Button>
        </TabsContent>

        <TabsContent value="register">
          <Input
            placeholder="📧 Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            className="mb-4"
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="🔑 Пароль"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="mb-4"
            disabled={loading}
          />

          {error && tab === "register" && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleRegister} className="w-full" disabled={loading}>
            {loading ? "⏳ Регистрируем..." : "Зарегистрироваться"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
