import { useUser } from "./useUser";
import { GridIcon, UserCircleIcon } from "../icons";
import type { NavItem } from "../layout/AppSidebar.tsx";

interface UserInfo {
  loai_nguoi_dung?: string;
}

// MENU CHO ADMIN
const adminNav: NavItem[] = [
  { name: "Thống kê", icon: <GridIcon />, path: "/dashboard" },
  { name: "Hồ sơ cá nhân", icon: <UserCircleIcon />, path: "/profile" },
];

// MENU CHO GIẢNG VIÊN
const teacherNav: NavItem[] = [
  {
    name: "Thốg kê lớp cố vấn",
    icon: <GridIcon />,
    path: "/dashboard/ecommerce",
  },
  {
    name: "Thống kê sinh viên",
    icon: <GridIcon />,
    path: "/ecommerce-analytics",
  },
  { name: "Hồ sơ cá nhân", icon: <UserCircleIcon />, path: "/profile" },
];

// MENU CHO SINH VIÊN
const studentNav: NavItem[] = [
  { name: "Sinh viên", icon: <UserCircleIcon />, path: "/students" },
  { name: "Hồ sơ cá nhân", icon: <UserCircleIcon />, path: "/profile" },
];

export const useSidebarItems = () => {
  const user = useUser() as UserInfo | null;

  if (!user) return studentNav;

  switch (user.loai_nguoi_dung) {
    case "QuanTri":
      return adminNav;
    case "GiangVien":
      return teacherNav;
    case "SinhVien":
      return studentNav;
    default:
      return studentNav;
  }
};
