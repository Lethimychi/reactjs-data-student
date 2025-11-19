import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useUser } from "./hooks/useUser";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";

import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import EcommerceAnalytics from "./pages/ecommerce/EcommerceAnalytics";
import DashboardLanding from "./pages/Dashboard/DashboardLanding";
import RequireRole from "./components/common/RequireRole";
import StudentPage from "./pages/Students/page";
import ChartSectionPage from "./pages/Students/sectionPage";

export default function App() {
  // Redirect component that sends users to their default landing page based on role
  const RedirectByRole: React.FC = () => {
    const user = useUser();
    // If not logged in, send to signin
    if (!user) return <Navigate to="/signin" replace />;

    const role = user?.loai_nguoi_dung ?? user?.role ?? "";
    switch (role) {
      case "QuanTri":
        return <Navigate to="/dashboard" replace />;
      case "GiangVien":
        return <Navigate to="/dashboard/ecommerce" replace />;
      case "SinhVien":
        return <Navigate to="/students" replace />;
      default:
        return <Navigate to="/signin" replace />;
    }
  };

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<RedirectByRole />} />
            <Route
              path="/dashboard"
              element={
                <RequireRole allowed={["QuanTri"]}>
                  <DashboardLanding />
                </RequireRole>
              }
            />
            <Route
              path="/dashboard/ecommerce"
              element={
                <RequireRole allowed={["QuanTri", "GiangVien", "SinhVien"]}>
                  <Home />
                </RequireRole>
              }
            />
            <Route path="/students" element={<StudentPage />} />
            <Route path="/sections" element={<ChartSectionPage />} />
            <Route
              path="/ecommerce"
              element={
                <RequireRole allowed={["QuanTri", "GiangVien", "SinhVien"]}>
                  <Home />
                </RequireRole>
              }
            />
            <Route
              path="/ecommerce-analytics"
              element={<EcommerceAnalytics />}
            />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />

            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
