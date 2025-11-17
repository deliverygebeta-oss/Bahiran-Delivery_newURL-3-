// App.jsx
import { useEffect , useState} from "react";
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
import MoneyFlow from "./pages/A-DemoPages/A-analytics";
import { useOrderFetcher } from "./services/OrderPollingService";
import FirstLogin from "./components/firstLogin";
import AllFoods from "./components/VPLocation/allFoods";
// import CL from "./components/VPLocation/CL";

function App() {
  const { user } = useUserStore();
  const userRole = user?.role;
  const firstLogin = user?.firstLogin;
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  
    console.log(userRole, firstLogin);
  setInterval(() => {
    setShowFirstLogin(true);
  }, 500000);
  useOrderFetcher();

  return (
    <>
    {userRole === "Manager" && firstLogin === true && showFirstLogin && <FirstLogin />}
      {/* <FirstLogin /> */}
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
          <Route path="/money-flow" element={<MoneyFlow />} />

          <Route
            path="/managerDashboard"
            element={
              <ManagerNav />
            }
          />
          <Route
            path="/adminDashboard"
            element={
              // <ProtectedRoute allowedRoles={["Admin"]}>
              // </ProtectedRoute>
              <AdminNav />
            }
          />
          <Route path="*" element={<NotFoundPage />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;