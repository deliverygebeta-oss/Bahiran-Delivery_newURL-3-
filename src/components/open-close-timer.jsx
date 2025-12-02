import { useState, useMemo } from "react";

const TimerToggle = () => {
  // Get user data from sessionStorage and extract isOpenNow status
  const userData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user-data"));
    } catch {
      return null;
    }
  }, []);
  setTimeout(() => {
    // console.log(userData);
  }, 1000);
  const restaurantFromStore = userData?.state?.restaurant;
  const [isOpen, setIsOpen] = useState(Boolean(restaurantFromStore?.isOpenNow));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle switch toggle and PATCH request
  const handleToggle = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("isOpenNow", String(!isOpen));
      const res = await fetch(
        `https://api.bahirandelivery.cloud/api/v1/restaurants/${restaurantFromStore?.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );
      const result = await res.json();
      // console.log(result);

      if (res.ok && result.status === "success") {
        setIsOpen(prev => !prev);
        setSuccessMsg(`Restaurant is now ${!isOpen ? "OPEN" : "CLOSED"}.`);
        // Also update sessionStorage to persist change
        try {
          const existing = sessionStorage.getItem("user-data");
          const parsed = existing ? JSON.parse(existing) : null;
          const responseRestaurant =
            result?.data?.restaurant ||
            result?.data?.updatedRestaurant ||
            result?.restaurant ||
            null;
          const updatedRestaurant = responseRestaurant
            ? responseRestaurant
            : { ...(parsed?.state?.restaurant || restaurantFromStore), isOpenNow: !isOpen };
          const nextUserData = parsed
            ? { ...parsed, state: { ...parsed.state, restaurant: updatedRestaurant } }
            : { state: { restaurant: updatedRestaurant } };
          sessionStorage.setItem("user-data", JSON.stringify(nextUserData));
        } catch (_) { }
      } else {
        setError(result?.message || "Failed to update status.");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 scale-90">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={isOpen}
          onChange={handleToggle}
          disabled={loading}
        />
        <div
          className={`relative w-20 h-8 rounded-full transition-colors duration-200 border-2 ${isOpen ? "bg-green-500 border-green-500" : "bg-gray-300 border-red-"
            }`}
        >
          {/* Text inside the switch */}
          <span
            className={`absolute top-1/2 transform -translate-y-1/2 text-[10px] font-semibold tracking-wide transition-all duration-200 ${isOpen
                ? "left-2 text-white" // Move left when open
                : "right-2 text-gray-700" // Move right when closed
              }`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </span>

          {/* Knob */}
          <div
            className={`absolute top-[3px] left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isOpen ? "translate-x-12" : "translate-x-0 bg-red-300"
              }`}
          ></div>
        </div>
      </label>

      
    </div>

  );
};

export default TimerToggle;
