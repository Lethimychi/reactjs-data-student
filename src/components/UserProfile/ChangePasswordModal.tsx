import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Modal } from "../ui/modal";
import { Label } from "recharts";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { changePassword } from "../../utils/auth/api";
import Toast from "../notification/toast";
import ValidationError from "./helper/ValidationError";

// Mock components - replace with your actual imports

interface PasswordStrengthProps {
  value: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value }) => {
  const getStrength = () => {
    if (value.length === 0) return { label: "", color: "", width: "0%" };
    if (value.length < 8)
      return { label: "Yếu", color: "bg-red-500", width: "33%" };
    if (value.length < 12)
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
    } catch (err: any) {
      // Extract API error message if available
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      console.error(message);
      setToast({ message: "Mật khẩu cũ không đúng", type: "error" });
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
        <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-5 dark:bg-gray-900 lg:p-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Đổi Mật Khẩu
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Giữ tài khoản của bạn an toàn với mật khẩu mạnh.
          </p>

          <div className="mt-6 space-y-5">
            {/* Current Password */}
            <div>
              <Label>Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, current: true }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                <ValidationError
                  message={touched.current ? errors.current : ""}
                />
              </p>
            </div>

            {/* New Password */}
            <div>
              <Label>Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, new: true }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength - Fixed Height Container */}
              <div className="h-6 mt-2">
                <PasswordStrength value={newPassword} />
              </div>
              {/* Validation Error */}
              <div className="mt-1 min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                {touched.new && errors.new ? errors.new : "\u00A0"}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label>Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, confirm: true }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid || loading}>
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
