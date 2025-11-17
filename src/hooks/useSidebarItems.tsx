import { useUser } from "./useUser";
import { GridIcon, UserCircleIcon } from "../icons";
import type { NavItem } from "../layout/AppSidebar.tsx";

interface UserInfo {
  loai_nguoi_dung?: string;
}

// MENU CHO ADMIN
const adminNav: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/dashboard" },
  { name: "User Profile", icon: <UserCircleIcon />, path: "/profile" },
];

// MENU CHO GIẢNG VIÊN
const teacherNav: NavItem[] = [
  { name: "Ecommerce", icon: <GridIcon />, path: "/dashboard/ecommerce" },
  { name: "Analytics", icon: <GridIcon />, path: "/ecommerce-analytics" },
  { name: "User Profile", icon: <UserCircleIcon />, path: "/profile" },
];

// MENU CHO SINH VIÊN
const studentNav: NavItem[] = [
  { name: "Students", icon: <UserCircleIcon />, path: "/students" },
  { name: "User Profile", icon: <UserCircleIcon />, path: "/profile" },
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
