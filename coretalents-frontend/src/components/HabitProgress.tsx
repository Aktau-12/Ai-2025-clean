interface HabitProgressProps {
  weekLog: boolean[];
}

const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const HabitProgress = ({ weekLog }: HabitProgressProps) => {
  return (
    <div className="flex gap-1 justify-center mt-2 text-sm">
      {dayLabels.map((label, index) => (
        <div
          key={index}
          className={`px-2 py-1 rounded-md border text-xs ${
            weekLog[index]
              ? "bg-green-500 text-white border-green-500"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default HabitProgress;
