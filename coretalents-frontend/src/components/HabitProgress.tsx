// src/components/HabitProgress.tsx

interface HabitProgressProps {
  weekLog: boolean[];
}

const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const HabitProgress = ({ weekLog }: HabitProgressProps) => {
  return (
    <div className="flex justify-between items-center gap-1 mt-3 text-sm">
      {dayLabels.map((label, index) => (
        <div
          key={index}
          className={`flex flex-col items-center px-1 py-1 rounded-md text-xs w-8
            ${
              weekLog[index]
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-200 text-gray-500"
            }`}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default HabitProgress;
