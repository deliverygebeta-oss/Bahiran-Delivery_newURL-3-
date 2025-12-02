import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useUserId } from "../../contexts/userIdContext";
import { Loading, InlineLoadingDots } from "../Loading/Loading";

const EditUser = ({ id, phone }) => {
  const navigate = useNavigate();
  console.log(id, phone);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    fcnNumber: "",
    deliveryMethod: "",
    role: "",
    profilePicture: ""
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMg, setErrorMg] = useState("");
  const [success, setSuccess] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);

  const webcamRef = useRef(null);

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://api.bahirandelivery.cloud/api/v1/users/getUser?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const result = await res.json();
        setFormData({
          firstName: result.data.user.firstName || "",
          lastName: result.data.user.lastName || "",
          fcnNumber: result.data.user.fcnNumber || "",
          phone: result.data.user.phone || "",
          role: result.data.user.role || "",
          deliveryMethod: result.data.user.deliveryMethod || "",
          profilePicture: result.data.user.profilePicture || "",
        });
      } catch (err) {
        setErrorMg("Failed to load user info");
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Capture photo from webcam
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setProfilePicture(imageSrc);
      setIsCameraActive(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMg("");
    setSuccess("");

    try {
      const sanitizedPhone =
        formData.phone.startsWith("0")
          ? formData.phone.slice(1)
          : formData.phone;
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("phone", sanitizedPhone);
      if(formData.role === "Manager" || formData.role === "Delivery_Person"){
        form.append("role", formData.role);
        form.append("fcnNumber", formData.fcnNumber);
        form.append("deliveryMethod", formData.deliveryMethod);
      }
      if(formData.role === "Delivery_Person"){
        if (profilePicture) {
          // Convert base64 to file if it's a data URL (from webcam)
          if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
            const response = await fetch(profilePicture);
            const blob = await response.blob();
            const fileName = `profile_${formData.firstName}_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            form.append("profilePicture", file);

          }
        }
      }
      const res = await fetch(
        `https://api.bahirandelivery.cloud/api/v1/users/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: form,
        }
      );
      console.log(res);

      if (!res.ok) throw new Error("Failed to update");

      setSuccess("User updated successfully!");
    } catch (err) {
      setErrorMg("Something went wrong while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* FULL-SCREEN CAMERA VIEW */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90 rounded-lg">
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            screenshotFormat="image/png"
            className="w-full max-w-md rounded-xl border-4 border-[#deb770] shadow-lg"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user",
            }}
          />
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={capture}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={() => setIsCameraActive(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="">
        {/* Header */}
        {/* Horizontal Layout Card */}
        <div className="bg-white  overflow-hidden ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Panel - Profile Picture & Basic Info */}
            <div className="bg-[#f4f1e9] p-2 lg:p-3 ">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Photo</h2>
                <div className="relative inline-block">
                  <img
                    src={profilePicture || formData.profilePicture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover object-center border-2 border-[] shadow-md mx-auto"
                  />
                  {/* Show edit button only for delivery persons */}
                  {formData.role === "Delivery_Person" && (
                    <button
                      type="button"
                      onClick={() => setIsCameraActive(true)}
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.role === "Delivery_Person" ? "Click to take photo" : "Profile photo"}
                </p>
              </div>

              {/* Name Row - Centered */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {["firstName", "lastName"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize text-center">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Phone - Centered */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 text-center">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Form Fields */}
            <div className="p-2 lg:p-3">
              <div className="space-y-3">
                {/* FCN Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    FCN Number
                    {/* <span className={formData.role && formData.role.toLowerCase() === "customer" ? " hidden" : " text-red-500"}> *</span> */}
                  </label>
                  <input
                    type="text"
                    name="fcnNumber"
                    value={formData.fcnNumber}
                    onChange={handleChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter FCN number"
                    disabled={formData.role && formData.role.toLowerCase() === "customer"}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Change Role </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option className="hidden" value="">Change Role</option>
                    {/* <option value="admin">Admin</option> */}
                    <option 
                      value="Customer" 
                      className={formData.role === "Customer" ? "font-bold " : ""}
                    >
                      Customer {formData.role === "Customer" && " (Current)"}
                    </option>
                    <option 
                      value="Manager" 
                      className={formData.role === "Manager" ? "font-bold " : ""}
                    >
                      Manager {formData.role === "Manager" && " (Current)"}
                    </option>
                    <option 
                      value="Delivery_Person" 
                      className={formData.role === "Delivery_Person" ? "font-bold " : ""}
                    >
                      Delivery {formData.role === "Delivery_Person" && " (Current)"}
                    </option>
                  </select>
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">vehicle type</label>
                  <select
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    disabled={formData.role && (formData.role === "Customer" || formData.role === "Manager")}
                  >
                    <option className="hidden" value="">Select Delivery Method</option>
                    <option 
                      value="Car" 
                      className={formData.deliveryMethod === "Car" ? "font-bold " : ""}
                    >
                      Car {formData.deliveryMethod === "Car" && " (Current)"}
                    </option>
                    <option 
                      value="Motor" 
                      className={formData.deliveryMethod === "Motor" ? "font-bold " : ""}
                    >
                      Motor {formData.deliveryMethod === "Motor" && " (Current)"}
                    </option>
                    <option 
                      value="Bicycle" 
                      className={formData.deliveryMethod === "Bicycle" ? "font-bold " : ""}
                    >
                      Bicycle {formData.deliveryMethod === "Bicycle" && " (Current)"}
                    </option>
                  </select>
                </div>
              </div>

              {/* Messages - Right Aligned */}
              <div className="mt-2 space-y-1">
                {errorMg && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-xs">{errorMg}</p>
                  </div>
                )}
                
                {success && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-xs">{success}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-[#f4f1e9] px-2 py-2 flex justify-end">            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 shadow ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#deb770] to-[#deb770] hover:from-[#deb770] hover:to-[#deb770] active:scale-95'
              }`}
            >
              {loading ? (
                <div className="flex justify-center">
                  <div className="flex items-center">
                    <InlineLoadingDots />
                  </div>
                </div>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;