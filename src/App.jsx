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

  // Determine if this is the actual first login
  const storedUserData = sessionStorage.getItem("user-data");
  const sessionUser = storedUserData ? JSON.parse(storedUserData) : null;
  const isActualFirstLogin = user?.firstLogin ?? sessionUser?.state?.user?.firstLogin ?? false;

  // State to control whether the FirstLogin modal is visible
  const [showFirstLogin, setShowFirstLogin] = useState(false);

  useEffect(() => {
    // Show immediately if it's the real first login and user is Manager
    if (userRole === "Manager" && isActualFirstLogin) {
      setShowFirstLogin(true);
    }

    // For testing/demo: Re-show the modal every 25 minutes (1500000 ms)
    const interval = setInterval(() => {
      if (userRole === "Manager") {
        console.log("25 minutes passed — showing FirstLogin modal again for demo");
        setShowFirstLogin(true);
      }
    }, 1500); // 25 minutes

    // Cleanup interval when component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [userRole, isActualFirstLogin]);

  useOrderFetcher();

  return (
    <>
      {/* Show FirstLogin modal: either on real first login OR every 25 minutes (for demo) */}
      {userRole === "Manager" && showFirstLogin && (
        <FirstLogin onClose={() => setShowFirstLogin(false)} />
      )}

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