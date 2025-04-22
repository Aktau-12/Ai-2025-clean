// ✅ thinkingAlgorithmData.ts

export interface Node {
  id: string;
  text: string;
  yes?: string;
  no?: string;
  result?: string;
}

const thinkingData: Node[] = [
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
    result: "Откажитесь от задачи.",
    text: "Решение:"
  },
  {
    id: "delegate",
    result: "Делегируйте задачу.",
    text: "Решение:"
  },
  {
    id: "later",
    result: "Перенесите задачу на более подходящее время.",
    text: "Решение:"
  },
  {
    id: "simplify",
    result: "Упростите или сократите объём работы.",
    text: "Решение:"
  },
  {
    id: "simpler",
    result: "Выберите более эффективный способ.",
    text: "Решение:"
  },
  {
    id: "done",
    result: "Выполняйте задачу!",
    text: "Решение:"
  },
];

export default thinkingData;
