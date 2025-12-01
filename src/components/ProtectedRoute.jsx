// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userData = JSON.parse(sessionStorage.getItem("user-data")).state.user;
  const userRole = userData?.role;
  console.log(userRole);

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to not authorized or login page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
