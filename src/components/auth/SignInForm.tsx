import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

import { loginApi } from "../../utils/api";

export default function SignInForm() {
  const navigate = useNavigate();

  // State form
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Xử lý change cho input thường
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý Checkbox custom
  const handleCheckbox = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      remember: checked,
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await loginApi(form.username, form.password);

      console.log("✅ Login success:", res);

      // Remember username
      if (form.remember) {
        localStorage.setItem("remember_username", form.username);
      } else {
        localStorage.removeItem("remember_username");
      }

      // Determine role and navigate to appropriate default
      // prefer server-provided user_info, fallback to localStorage
      const userInfo =
        res.user_info ||
        (() => {
          try {
            return JSON.parse(String(localStorage.getItem("user_info")));
          } catch {
            return null;
          }
        })();

      const role = userInfo?.loai_nguoi_dung || userInfo?.role;

      if (role === "QuanTri") navigate("/dashboard");
      else if (role === "GiangVien") navigate("/dashboard/ecommerce");
      else if (role === "SinhVien") navigate("/students");
      else navigate("/signin");
    } catch (err) {
      console.error("❌ Login error:", err);
      setErrorMessage("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Back */}

      {/* Form Container */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <h1 className="text-title-md font-semibold text-gray-800 mb-2">
          Đăng nhập
        </h1>
        <p className="text-sm text-gray-500">Nhập thông tin để đăng nhập</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Username */}
          <div>
            <Label>
              Tên đăng nhập <span className="text-red-500">*</span>
            </Label>
            <Input
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <Label>
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              ></span>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={form.remember} onChange={handleCheckbox} />
              <span className="text-sm text-gray-700">Giữ đăng nhập</span>
            </div>

            <Link to="/reset-password" className="text-sm text-blue-500">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}

          {/* Submit */}
          <Button className="w-full" type="submit" size="sm">
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
