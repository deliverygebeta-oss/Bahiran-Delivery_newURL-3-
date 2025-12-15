// App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassPage from "./pages/ForgotPassPage";
import OTPPage from "./pages/OTPPage";
import ManagerNav from "./components/Sidebar/M-SidBarNav";
import Landing from "./pages/Landing";
import NotFoundPage from "./pages/NotFoundPage";
import AdminNav from "./components/Sidebar/A-sidBarNav";
import Verify from "./pages/verify";
import GlobalNotifications from "./components/GlobalNotifications";
import useUserStore from "./Store/UseStore";
import { useOrderFetcher } from "./services/OrderPollingService";
import FirstLogin from "./components/firstLogin";
import AllFoods from "./components/VPLocation/allFoods";
import ProtectedRoute from "./components/ProtectedRoute";
import AInfoCards from "./pages/A-DemoPages/InfoCards";

function App() {
  const { user } = useUserStore();
  const userRole = user?.role;

  // Prefer user from Zustand store; fallback to sessionStorage if needed
  const storedUserData = sessionStorage.getItem("user-data");
  const sessionUser = storedUserData ? JSON.parse(storedUserData) : null;
  const firstLogin = user?.firstLogin ?? sessionUser?.state?.user?.firstLogin ?? false;

  // Remove the interval entirely (it was causing leaks and unwanted behavior)
  // If you need it for testing, use useEffect with proper cleanup:
  /*
  const [showFirstLogin, setShowFirstLogin] = useState(false);

  useEffect(() => {
    if (userRole === "Manager" && firstLogin) {
      setShowFirstLogin(true);
    }

    // Example: for testing only
    const interval = setInterval(() => {
      setShowFirstLogin(true);
    }, 500000); // ~8.3 minutes

    return () => clearInterval(interval); // Cleanup on unmount/re-render
  }, [userRole, firstLogin]);
  */

  useOrderFetcher();

  return (
    <>
      {/* Show FirstLogin modal only for managers on their first login */}
      {userRole === "Manager" && firstLogin && <FirstLogin />}

      <GlobalNotifications />

      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/CL" element={<AllFoods />} />
          <Route path="/firstLogin" element={<FirstLogin />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/a-info-cards" element={<AInfoCards />} />

          <Route path="/managerDashboard" element={<ManagerNav />} />

          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminNav />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;