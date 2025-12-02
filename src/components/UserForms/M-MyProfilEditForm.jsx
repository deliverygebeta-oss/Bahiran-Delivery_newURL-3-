import { useState, useEffect } from "react";
import axios from "axios";
import { InlineLoadingDots} from "../Loading/Loading";
import useStore from "../../Store/UseStore";
import { useUserProfile } from "../../contexts/UserProfileContext";

const ProfileEditForm = () => {
  const { userProfile, setUserProfile } = useUserProfile();
  const { setUser } = useStore();

  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    restaurantName: "",
    restaurantAddress: "",
    profilePicture: "",
  });

  // Load user data from sessionStorage
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user-data"))?.state?.user;

    if (storedUser) {
      setFormData({
        username: storedUser.username || "",
        firstName: storedUser.firstName || "",
        lastName: storedUser.lastName || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        restaurantName: storedUser.restaurantName || "",
        restaurantAddress: storedUser.restaurantAddress || "",
        profilePicture: storedUser.profilePicture || "",
      });
    }
  }, []);

  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();

      // Only append fields that backend expects
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      // form.append("email", formData.email);
      // form.append("phone", formData.phone);
      if (profilePicture) {
        form.append("profilePicture", profilePicture);
      }

      const response = await axios.patch(
        "https://api.bahirandelivery.cloud/api/v1/users/updateMe",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);

      if (response?.data?.data?.user) {
        const updatedUser = response.data.data.user;

        // Update Zustand
        setUser(updatedUser);

        // Update sessionStorage
        sessionStorage.setItem(
          "user-data",
          JSON.stringify({ state: { user: updatedUser } })
        );

        alert("Profile updated successfully!");
        setUserProfile(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while updating the profile.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex border-t-2 border-[#deb770] pt-5">
      {/* Profile Image & Upload */}
      <div className="flex flex-col gap-2 p-2">
        <img
          src={
            profilePicture
              ? URL.createObjectURL(profilePicture)
              : formData.profilePicture || "/default-avatar.jpg"
          }
          alt="Profile"
          className="w-[230px] h-[200px] rounded-xl object-cover"
        />
        <label className="flex items-center justify-center w-[230px] p-2 border border-gray rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <svg 
            className="w-5 h-5 mr-2 text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-sm font-medium text-primary">Upload Image</span>
          <input
            type="file"
            name="profilePicture"
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>

      {/* Text Fields */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 text-sm justify-center p-5 w-full"
      >
        <div>
          <label className="block text-l font-medium text-primary">Username</label>
          <input
            name="username"
            type="text"
            className="w-full border-[0.5px] border-gray p-2 rounded-lg"
            value={formData.username}
            onChange={handleChange}
            disabled // Not submitted to backend yet
          />
        </div>

        <div className="flex gap-10">
          <div>
            <label className="block text-sm font-medium text-primary">First Name</label>
            <input
              name="firstName"
              type="text"
              className="w-full border-[0.5px] border-gray p-2 rounded-lg"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Last Name</label>
            <input
              name="lastName"
              type="text"
              className="w-full border-[0.5px] border-gray p-2 rounded-lg"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-primary">Email</label>
          <input
            name="email"
            type="email"
            className="w-full border-[0.5px] border-gray p-2 rounded-lg"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div> */}

        <div className="flex gap-10">
          <div>
            <label className="block text-sm font-medium text-primary">Restaurant Name</label>
            <input
              name="restaurantName"
              type="text"
              className="w-full border-[0.5px] border-gray p-2 rounded-lg"
              value={formData.restaurantName}
              onChange={handleChange}
              disabled // Not submitted to backend yet
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Restaurant Address</label>
            <input
              name="restaurantAddress"
              type="text"
              className="w-full border-[0.5px] border-gray p-2 rounded-lg"
              value={formData.restaurantAddress}
              onChange={handleChange}
              disabled // Not submitted to backend yet
            />
          </div>
          <div>
            {/* <label className="block text-sm font-medium text-primary">Phone Number</label>
            <input
              name="phone"
              type="text"
              className="w-full border-[0.5px] border-gray p-2 rounded-lg"
              value={formData.phone}
              onChange={handleChange}
              required
            /> */}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end items-center mt-10">
          <button
            type="submit"
            className={`bg-primary text-white px-6 py-2 rounded-lg hover:bg-white hover:text-primary border border-gray transition-all duration-300 ${loading ? "cursor-not-allowed bg-white" : ""}`}
          >
            {loading ? <InlineLoadingDots /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
