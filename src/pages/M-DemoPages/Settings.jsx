import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EditRestaurantForm from "../../components/UserForms/M-EditRestaurantForm";
import { Loading, InlineLoadingDots } from "../../components/Loading/Loading";
import useUserStore from "../../Store/UseStore";

const Settings = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState("");
  const { clearMenusCache } = useUserStore();

  const token = localStorage.getItem("token");

  const logout = () => {
    // Clear all user-related data from both storage types
    sessionStorage.clear(); // Clear all session storage as backup
    sessionStorage.removeItem("user-data");
    sessionStorage.removeItem("Admin-data");
    localStorage.removeItem("token");
    
    // Clear menus and foods cache
    clearMenusCache();
    
    setMessage("Get back soon 👋");
    setTimeout(() => {
    sessionStorage.clear(); // Clear all session storage as backup
      navigate("/login");
    }, 2000);
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const res = await fetch(
        "https://api.bahirandelivery.cloud/api/v1/users/deleteMe",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setMessage("Account deleted successfully");
        localStorage.removeItem("token");
        sessionStorage.removeItem("user-data");
        setTimeout(() => {
          navigate("/signup"); // or "/login" based on your flow
        }, 2000);
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || "Failed to delete account.");
      }
    } catch (error) {
      setMessage("An error occurred while deleting the account.");
    } finally {
      setLoading(false);
    }
  };


  const userData = JSON.parse(sessionStorage.getItem("user-data"))
  const role = userData.state.user.role
  console.log(role)

  return (
    <>
    <div className="motion-preset-focus motion-duration-300 bg-[#f9f5f0] pb-[4px]">
      <div className="bg-[#f9f5f0] translate-x-12 rounded w-fit ">
        <button
          onClick={()=>{setShowEditForm("Edit Restaurant")}}
          className={`px-3 text-sm py-2 text-white font-semibold shadow-md bg-amber-900 transform-all duration-300 ${role === "Manager" ? "" : "hidden"} ${showEditForm === "Edit Restaurant" ? "bg-[#b55d1f] -translate-y-1" : ""} 
          ` 
        }
        >
          Restaurant settings
        </button>
        <button
          onClick={()=>{setShowEditForm("Account settings")}}
          className={`px-3 text-sm py-2 text-white font-semibold shadow-md transition-all duration-300 bg-amber-900 transform-all ${showEditForm === "Account settings" || showEditForm === "" ? "bg-[#b55d1f] -translate-y-1" : ""}` }
        >
          Account settings
        </button>
      </div>

      {showEditForm === "Edit Restaurant" && role === "Manager"  ? (
        <EditRestaurantForm />
      ) : (
        <div className="max-w-screen mx-auto p-4 space-y-6 h-[calc(100vh-106px)]  bg-[#f9f5f0] flex justify-center items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Account Settings</h1>

            {/* Demo Setting Options */}
            <div className="space-y-2">
              <div className="p-4 border border-gray rounded-lg shadow">
                <h2 className="text-xl font-semibold">
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-600">Coming soon...</p>
              </div>

              <div className="p-4 border border-gray rounded-lg shadow">
                <h2 className="text-xl font-semibold">Dark Mode</h2>
                <p className="text-sm text-gray-600">Coming soon...</p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded "
                onClick={logout}
              >
                Log Out
              </button>
            </div>

            {/* Delete Account Section */}
            <div className="mt-6 border-t pt-4">
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              <p className="text-gray-600 text-sm mb-2">
                Deleting your account is permanent and cannot be undone.
              </p>
              <button
                className="bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded"
                onClick={deleteAccount}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete My Account"}
              </button>
            </div>

            {/* Message */}
            {message && (
              <p className="text-center text-green-700 mt-4">{message}</p>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Settings;