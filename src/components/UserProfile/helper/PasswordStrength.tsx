// components/PasswordStrength.tsx
import clsx from "clsx";

interface PasswordStrengthProps {
  value: string;
}

export default function PasswordStrength({ value }: PasswordStrengthProps) {
  const getScore = () => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  };

  const score = getScore();

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx(
              "h-1 w-full rounded transition-all",
              i <= score - 1
                ? colors[score - 1]
                : "bg-gray-300 dark:bg-gray-700"
            )}
          />
        ))}
      </div>

      {value && (
        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {labels[score - 1] ?? "Too short"}
        </p>
      )}
    </div>
  );
}
