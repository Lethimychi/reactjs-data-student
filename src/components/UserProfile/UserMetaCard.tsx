import { useModal } from "../../hooks/useModal";
import { useUser } from "../../hooks/useUser"; // <- thêm dòng này

import ChangePasswordModal from "./ChangePasswordModal";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const user = useUser(); // lấy user từ localStorage

  if (!user) return <div>User not found</div>;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Avatar & user info */}
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src="/images/user/owner.jpg" alt="user" />
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.ho_ten}
              </h4>

              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.loai_nguoi_dung}
                </p>

                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mã số: {user.username}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white 
             px-5 py-3 text-sm font-medium text-gray-700 shadow-sm 
             whitespace-nowrap flex-nowrap
             hover:bg-gray-50 hover:text-gray-800 
             dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 
             dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 11h12v10H6z"
              />
            </svg>
            Đổi mật khẩu
          </button>
        </div>
      </div>
      <ChangePasswordModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
