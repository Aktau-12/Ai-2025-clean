import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        username: email,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/test");
    } catch (error) {
      alert("Ошибка входа");
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:8000/auth/register", {
        email: registerEmail,
        password: registerPassword,
      });
      alert("Успешно зарегистрирован! Войдите.");
    } catch (error) {
      alert("Ошибка регистрации");
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-xl">
      <Tabs defaultValue="login">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Вход</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleLogin} className="w-full">
            Войти
          </Button>
        </TabsContent>

        <TabsContent value="register">
          <Input
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleRegister} className="w-full">
            Зарегистрироваться
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
