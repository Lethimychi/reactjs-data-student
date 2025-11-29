import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { changePassword } from "../../utils/auth/api";
import Toast from "../notification/toast";
import ValidationError from "./helper/ValidationError";
// Note: Label import removed (not used)

interface PasswordStrengthProps {
  value: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value }) => {
  const getStrength = () => {
    const lower = /[a-z]/.test(value);
    const upper = /[A-Z]/.test(value);
    const number = /[0-9]/.test(value);
    const special = /[^A-Za-z0-9]/.test(value);

    const score = [lower, upper, number, special].filter(Boolean).length;

    if (value.length === 0) return { label: "", color: "", width: "0%" };

    if (value.length < 8 || score <= 1)
      return { label: "Yếu", color: "bg-red-500", width: "25%" };

    if (value.length < 12 || score <= 3)
      return { label: "Trung bình", color: "bg-yellow-500", width: "66%" };

    return { label: "Mạnh", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength();
  if (!value) return null;

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
      {strength.label && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Độ mạnh: {strength.label}
        </p>
      )}
    </div>
  );
};
interface ChangePasswordModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  closeModal,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Track which fields the user has touched
  const [touched, setTouched] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  }>({
    message: "",
    type: "success",
  });

  // Real-time validation that runs on every input change
  useEffect(() => {
    const newErrors = { current: "", new: "", confirm: "" };

    // Only validate touched fields
    if (touched.current && !currentPassword) {
      newErrors.current = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (touched.new) {
      if (newPassword.length > 0 && newPassword.length < 8) {
        newErrors.new = "Mật khẩu mới phải ít nhất 8 ký tự.";
      } else if (newPassword && newPassword === currentPassword) {
        newErrors.new = "Mật khẩu mới phải khác mật khẩu hiện tại.";
      }
    }

    if (touched.confirm) {
      if (confirmPassword && confirmPassword !== newPassword) {
        newErrors.confirm = "Mật khẩu xác nhận không khớp.";
      }
    }

    setErrors(newErrors);
  }, [currentPassword, newPassword, confirmPassword, touched]);

  // Form validation for submit
  const validateAll = () => {
    const newErrors = { current: "", new: "", confirm: "" };

    if (!currentPassword) {
      newErrors.current = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (newPassword.length < 8) {
      newErrors.new = "Mật khẩu mới phải ít nhất 8 ký tự.";
    } else if (newPassword === currentPassword) {
      newErrors.new = "Mật khẩu mới phải khác mật khẩu hiện tại.";
    }

    if (confirmPassword !== newPassword) {
      newErrors.confirm = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleSave = async () => {
    setTouched({ current: true, new: true, confirm: true });

    if (!validateAll()) return;

    setLoading(true);
    try {
      const result = await changePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (result && result.message) {
        setToast({ message: result.message, type: "success" });
        closeAndReset();
      }
    } catch (err: unknown) {
      // Extract API error message if available (safe cast)
      let rawMessage = "Có lỗi xảy ra. Vui lòng thử lại.";
      try {
        const e = err as {
          response?: { data?: { detail?: string | string[] } };
          message?: string;
        };
        const detail = e?.response?.data?.detail ?? e?.message;
        if (Array.isArray(detail)) rawMessage = detail.join(" ");
        else if (typeof detail === "string") rawMessage = detail;
      } catch {
        // ignore
      }

      // Helper: try to extract a focused sentence mentioning password rules
      const extractPasswordSentence = (msg: string) => {
        if (!msg) return msg;
        // Normalize spacing
        let normalized = msg.replace(/\s+/g, " ").trim();

        // Remove surrounding stray characters often present in API dumps like leading/trailing quotes, braces, or brackets
        const stripEdges = (s: string) => {
          const leadingChars = ['"', "'", "{", "[", "(", "<", " "];
          const trailingChars = ['"', "'", "}", "]", ")", ">", " "];
          let start = 0;
          let end = s.length;
          while (start < end && leadingChars.includes(s[start])) start++;
          while (end > start && trailingChars.includes(s[end - 1])) end--;
          return s.slice(start, end).trim();
        };
        normalized = stripEdges(normalized);
        // Also remove trailing punctuation (use Unicode-aware rule so Vietnamese letters stay intact)
        normalized = normalized.replace(/[^^\p{L}\p{N}\s]+$/u, "").trim();

        // If the API returned a JSON-like fragment with a 'detail' key (e.g. 'detail":"...'),
        // strip everything up to and including the colon so we only show the message.
        const detailIdx = normalized.toLowerCase().indexOf("detail");
        if (detailIdx >= 0) {
          const colon = normalized.indexOf(":", detailIdx);
          if (colon >= 0) {
            normalized = normalized.slice(colon + 1).trim();
            // remove wrapping quotes/braces left over
            normalized = normalized.replace(/^['"\s]+|['"\s]+$/g, "").trim();
          }
        }

        // Look for a sentence that contains key phrases like "Mật khẩu" and "chữ thường" (case-insensitive)
        const re = /(M(ậ|a)t khẩu[^.?!;\n]*chữ thường[^.?!;\n]*)/i;
        const m = normalized.match(re);
        if (m && m[1]) return m[1].trim();

        // Fallback: break into sentences by common delimiters and pick one containing any keyword
        const parts = normalized
          .split(/[.?!;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        const keywords = [
          "mật khẩu",
          "chữ thường",
          "chữ hoa",
          "ít nhất",
          "ký tự",
        ];
        for (const p of parts) {
          const low = p.toLowerCase();
          if (keywords.some((k) => low.includes(k))) return p;
        }

        // Final fallback: return the original cleaned message (trimmed)
        return normalized;
      };

      const message = extractPasswordSentence(rawMessage);
      console.error(message);
      // Show server message in toast (focused sentence)
      setToast({ message, type: "error" });

      // Map to inline fields when possible (use focused message)
      const lower = message.toLowerCase();
      if (lower.includes("mật khẩu cũ") || lower.includes("cũ")) {
        setErrors((prev) => ({ ...prev, current: message }));
      }
      if (
        lower.includes("chữ thường") ||
        lower.includes("chữ hoa") ||
        lower.includes("ký tự") ||
        lower.includes("ít nhất")
      ) {
        setErrors((prev) => ({ ...prev, new: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  function closeAndReset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({ current: "", new: "", confirm: "" });
    setTouched({ current: false, new: false, confirm: false });
    closeModal();
  }

  // Compute form validity directly from current values
  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword !== currentPassword &&
    confirmPassword === newPassword &&
    confirmPassword.length > 0 &&
    Object.values(errors).every((e) => e === "");

  return (
    <>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={closeAndReset}
        className="max-w-[500px] m-4"
      >
        <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-2 dark:bg-gray-900 lg:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Đổi Mật Khẩu
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Giữ tài khoản của bạn an toàn với mật khẩu mạnh.
              </p>
            </div>
            <button
              type="button"
              onClick={closeAndReset}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-2 space-y-5">
            {/* Current Password */}
            <div>
              <div className="mb-2">
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Mật khẩu hiện tại
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, current: true }))
                  }
                  className="w-full rounded-lg border px-3 py-2 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Nhập mật khẩu hiện tại"
                  aria-label="Mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className=" min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                <ValidationError
                  message={touched.current ? errors.current : ""}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="mb-2">
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Mật khẩu mới
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, new: true }))}
                  className="w-full rounded-lg border px-3 py-2 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Tối thiểu 8 ký tự"
                  aria-label="Mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="">
                <PasswordStrength value={newPassword} />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Yêu cầu: ít nhất 8 ký tự, có chữ thường và chữ hoa.
                </p>
              </div>
              <div className="mt-1 min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                <ValidationError message={touched.new ? errors.new : ""} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="mb-2">
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Xác nhận mật khẩu
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, confirm: true }))
                  }
                  className="w-full rounded-lg border px-3 py-2 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Nhập lại mật khẩu mới"
                  aria-label="Xác nhận mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                <ValidationError
                  message={touched.confirm ? errors.confirm : ""}
                />
              </p>
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeAndReset}
              disabled={loading}
              className="px-4 py-2 rounded-md"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || loading}
              className={`px-4 py-2 rounded-md ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700 text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Đang lưu...
                </div>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
