import { useState, useEffect } from "react";

const AddRestaurantsForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    license: "",
    locationAddress: "",
    locationDescription: "",
    latitude: "",
    longitude: "",
    cuisineTypes: "",
    deliveryRadiusMeters: "",
    imageCover: "",
    isDeliveryAvailable: false,
    isOpenNow: true,
    openHours: "",
    description: "",
    manager: "+251", // Good to keep the prefix
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [managerList, setManagerList] = useState([]);
  const [showManList, setShowManList] = useState([]);

  // --- NEW: useEffect to fetch managers on component mount ---
  
  useEffect(() => {
    const getManagerList = async () => {
      // Don't run if there's no token
      // if (!token) return;
      try {
        const response = await fetch(
          "https://api.bahirandelivery.cloud/api/v1/users?role=Manager",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            param:{ role: "manager" },
          }
        );
        const data = await response.json();
        // console.log( response.ok, data.data.users);

          // Filter for users with role 'manager' if possible, otherwise map all phones
        setManagerList(data.data.users.map((user) => user.phone) || []);
        // console.log("dddddddddddddd",managerList)
        
      } catch (error) {
        console.error("Error fetching manager list:", error);
      }
    };

    getManagerList();
  }, [token]); // Dependency array ensures this runs when the token is available

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- CORRECTED: The handler for the manager input ---
  const handleManagerInputChange = (value) => {
    // First, update the form data
    setFormData({ ...formData, manager: value });

    // Then, handle the suggestion list logic
    if (value && value.trim().length > 4) { // e.g., longer than "+251"
      const filteredList = managerList.filter((manager) =>
        manager.includes(value) // Use the direct 'value' here, not state
      );
      setShowManList(filteredList);
    } else {
      // Hide the list if the input is too short
      setShowManList([]);
    }
  };

  // --- NEW: Handler for selecting a manager from the list ---
  const handleSelectManager = (managerPhone) => {
    setFormData({ ...formData, manager: managerPhone });
    setShowManList([]); // Hide the list after selection
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const payload ={
      name: formData.name,
      license: formData.license,
      managerPhone: formData.manager, 
      cuisineTypes: formData.cuisineTypes
        .split(",")
        .map((cuisine) => cuisine.trim()),
      // deliveryRadiusMeters: parseInt(formData.deliveryRadiusMeters),
      // openHours: formData.openHours,
      description: formData.description,
      isDeliveryAvailable: formData.isDeliveryAvailable,
      // isOpenNow: formData.isOpenNow,
    }
    try {
      const response = await fetch(
        "https://api.bahirandelivery.cloud/api/v1/restaurants",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...payload
          }),
        }
      );

      const data = await response.json();
      console.log(payload)
      console.log("Response data:", data);

      if (response.ok) {
        setMessage("✅ Restaurant added successfully!");
        setFormData({
          name: "",
          license: "",
          locationAddress: "",
          locationDescription: "",
          latitude: "",
          longitude: "",
          cuisineTypes: "",
          deliveryRadiusMeters: "",
          imageCover: "",
          isDeliveryAvailable: false,
          isOpenNow: true,
          openHours: "",
          description: "",
          manager: "+251", // Reset to prefix
        });
      } else {
        setMessage(`❌ ${data.message || "Something went wrong."}`);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      setMessage("❌ Error submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Basic Info */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Restaurant Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              name="license"
              value={formData.license}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Assign a Manager */}
          {/* --- CORRECTED JSX with new handlers --- */}
          <div className="space-y-2 relative"> {/* Added relative for positioning list */}
            <label className="block text-sm font-medium text-gray-700">
              Assign a Manager
            </label>
            <input
              name="manager"
              value={formData.manager}
              onChange={(e) => handleManagerInputChange(e.target.value)}
              placeholder="Search manager phone..."
              autoComplete="off" // Good for custom dropdowns
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
            {/* Manager Suggestion List */}
            {showManList.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {showManList.map((managerPhone) => (
                  <li
                    key={managerPhone}
                    className="px-3 py-2 cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSelectManager(managerPhone)}
                  >
                    {managerPhone}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cuisine Types (comma-separated)
            </label>
            <input
              name="cuisineTypes"
              value={formData.cuisineTypes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* <div className="space-y-2 ">
            <label className="block text-sm font-medium text-gray-700">
              Delivery Radius (meters)
            </label>
            <input
              type="number"
              name="deliveryRadiusMeters"
              value={formData.deliveryRadiusMeters}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div> */}
          <div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Open Hours
              </label>
              <input
                name="openHours"
                value={formData.openHours}
                onChange={handleChange}
                placeholder="e.g. 8:00 AM - 10:00 PM"
                pattern="^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)\s-\s(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col gap-6 mt-4 items-center justify-center">
            {/* Delivery Available Switch */}
            <div className="flex items-center space-x-3 justify-between ">
              <span className="text-sm text-gray-700">Delivery Available</span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isDeliveryAvailable: !prev.isDeliveryAvailable,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isDeliveryAvailable ? "bg-amber-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isDeliveryAvailable
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-fit flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Add Restaurant"}
        </button>

        {/* Message */}
        {message && (
          <p
            className={`mt-3 text-sm font-medium ${
              message.includes("✅") ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </>
  );
};

export default AddRestaurantsForm;