import { CheckCircleIcon, XIcon, AlertCircleIcon } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Styles and icon based on type
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const Icon = type === "success" ? CheckCircleIcon : AlertCircleIcon;

  return (
    <div className="fixed top-6 left-1/2 z-[9999] -translate-x-1/2 animate-slide-down">
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg text-white ${bgColor}`}
      >
        <Icon size={20} />
        <p className="text-sm">{message}</p>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <XIcon size={16} />
        </button>
      </div>
    </div>
  );
}
