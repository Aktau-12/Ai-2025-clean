// ✅ thinkingAlgorithmData.ts

export interface Node {
  id: string;
  text: string;
  yes?: string;
  no?: string;
  result?: string;
}

/**
 * Набор узлов для алгоритма принятия решений.
 */
export const thinkingAlgorithmData: Node[] = [
  {
    id: "start",
    text: "Действительно ли это нужно делать?",
    yes: "self",
    no: "stop1",
  },
  {
    id: "self",
    text: "Должен ли я делать это сам?",
    yes: "now",
    no: "delegate",
  },
  {
    id: "now",
    text: "Нужно ли делать это прямо сейчас?",
    yes: "full",
    no: "later",
  },
  {
    id: "full",
    text: "Обязательно ли делать это в полном объёме?",
    yes: "simple",
    no: "simplify",
  },
  {
    id: "simple",
    text: "Есть ли более простой способ выполнить эту задачу?",
    yes: "simpler",
    no: "done",
  },
  {
    id: "stop1",
    text: "Решение:",
    result: "Откажитесь от задачи.",
  },
  {
    id: "delegate",
    text: "Решение:",
    result: "Делегируйте задачу.",
  },
  {
    id: "later",
    text: "Решение:",
    result: "Перенесите задачу на более подходящее время.",
  },
  {
    id: "simplify",
    text: "Решение:",
    result: "Упростите или сократите объём работы.",
  },
  {
    id: "simpler",
    text: "Решение:",
    result: "Выберите более эффективный способ.",
  },
  {
    id: "done",
    text: "Решение:",
    result: "Выполняйте задачу!",
  },
];
