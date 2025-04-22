// src/components/ui/card.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

// 📦 Карточка-обёртка
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border py-6 px-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

// 🔹 Заголовок карточки
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-2 flex flex-col gap-1", className)}
      {...props}
    />
  );
}

// 🔠 Название карточки
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-lg font-bold leading-none", className)}
      {...props}
    />
  );
}

// 📄 Описание карточки
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  );
}

// ✅ Контент внутри карточки
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-2", className)}
      {...props}
    />
  );
}

// 🔚 Нижняя часть карточки
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-4 flex items-center justify-end", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
