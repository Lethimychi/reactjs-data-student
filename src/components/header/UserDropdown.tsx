import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { logoutApi } from "../../utils/api";

import { useUser } from "../../hooks/useUser";

export default function UserDropdown() {
  const user = useUser(); // <-- lấy user từ localStorage
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const fullName = user?.ho_ten ?? "User";
  const username = user?.username ?? "unknown";
  const role = user?.loai_nguoi_dung ?? "unknown";

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-slate-700 dropdown-toggle dark:text-slate-400 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/images/user/owner.jpg" alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{username}</span>
        <svg
          className={`stroke-slate-500 dark:stroke-slate-400 transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-blue-100/50 bg-white p-3 shadow-lg shadow-blue-100/20 dark:border-blue-900/30 dark:bg-slate-950 transition-all"
      >
        <div>
          <span className="block font-medium text-slate-700 text-theme-sm dark:text-slate-400">
            {fullName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-slate-600 dark:text-slate-500">
            Chức vụ: {role}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-blue-100/50 dark:border-blue-900/30">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-slate-700 rounded-lg group text-theme-sm hover:bg-blue-50/50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all duration-300"
            >
              <svg
                className="fill-slate-600 group-hover:fill-blue-600 dark:fill-slate-500 dark:group-hover:fill-blue-400"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                  fill=""
                />
              </svg>
              Thông tin cá nhân
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={async (e) => {
            e.preventDefault();
            if (isLoggingOut) return;

            setIsLoggingOut(true);
            closeDropdown();

            const res = await logoutApi();

            console.log("Logout →", res.status, res.message);

            // Chuyển về trang login/signin
            navigate("/signin");
          }}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          className={`flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 ${
            isLoggingOut ? "opacity-60 cursor-wait" : ""
          }`}
        >
          {isLoggingOut ? "Signing out..." : "Đăng xuất"}
        </button>
      </Dropdown>
    </div>
  );
}
