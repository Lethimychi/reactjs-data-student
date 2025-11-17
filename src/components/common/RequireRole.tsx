import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

interface Props {
  allowed: string[];
  children: React.ReactElement;
}

export default function RequireRole({ allowed, children }: Props) {
  const user = useUser();
  const role = user?.loai_nguoi_dung as string | undefined;

  if (!user) {
    // not logged in → go to signin
    return <Navigate to="/signin" replace />;
  }

  if (!role || !allowed.includes(role)) {
    // if user has a role but not allowed, redirect to their default page
    if (role === "GiangVien")
      return <Navigate to="/dashboard/ecommerce" replace />;
    if (role === "SinhVien") return <Navigate to="/students" replace />;
    // fallback
    return <Navigate to="/signin" replace />;
  }

  return children;
}
