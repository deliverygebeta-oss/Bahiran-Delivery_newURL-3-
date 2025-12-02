import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "owner", // default
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    // const sanitizedPhone =
    // formData.phoneNumber.startsWith("0")
    //   ? formData.phoneNumber.slice(1)
    //   : formData.phoneNumber;
      setFormData({ ...formData, [e.target.name.trim()]: e.target.value.trim() });
      // switch (e.target.name) {
      //   case "firstName":
      //     setFormData({ ...formData, firstName: e.target.value.trim() });
      //     break;
      //   case "lastName":
      //     setFormData({ ...formData, lastName: e.target.value.trim() });
      //     break;
      //   case "phoneNumber":
      //     setFormData({ ...formData, phoneNumber: e.target.value.startsWith("0") ? e.target.value.slice(1) : e.target.value });
      //     break;
      //   case "password":
      //     setFormData({ ...formData, password: e.target.value.trim() });
      //     break;
      //   case "confirmPassword":
      //     setFormData({ ...formData, confirmPassword: e.target.value.trim() });
      //     break;
      //   default:
      //     break;
      // }
   
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }else{
      setError("")
    }
    const sanitizedPhone =
    formData.phoneNumber.startsWith("0")
      ? formData.phoneNumber.slice(1)
      : formData.phoneNumber;
    if (
      formData.firstName === "" ||
      formData.lastName === "" ||
      formData.phoneNumber === "" ||
      formData.password === "" ||
      formData.confirmPassword === ""
    ) {
      setError("All information are required");
      return;
    }else{
      setError("");
    }
    const isValidPassword = (password) => {
      if(!/[A-Z]/.test(password)){
        setError("Password must contain at least one uppercase letter");
        return false;
      }
      if(!/[a-z]/.test(password)){
        setError("Password must contain at least one lowercase letter");
        return false;
      }
      if(!/[0-9]/.test(password)){
        setError("Password must contain at least one digit");
        return false;
      }
      if(!/[^A-Za-z0-9]/.test(password)){
        setError("Password must contain at least one special character");
        return false;
      }
      if(password.length < 8){
        setError("Password must be at least 8 characters long");
        return false;
      }
       return true;
      
    };
    if (!isValidPassword(formData.password)) {
      return;
    }

   

    try {
      const response = await axios.post(
        "https://api.bahirandelivery.cloud/api/v1/users/sign",
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: sanitizedPhone,
          password: formData.password,
          role: formData.role,
        }
      );

      // Handle success (redirect to dashboard, store token, etc.)
      // console.log(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
    // console.log(formData)
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-cardBackground p-8 rounded-lg shadow-lg w-fit flex flex-col justify-self-center items-center mt-[20px] border-[0.5px] border-gray font-noto"
    >
      <div className="w-full space-y-1">
        <h1 className="text-[20px] font-bold text-center font-noto ">
          Join as Restaurant Partner
        </h1>
        <p className="text-[13px] text-gray-500 text-center font-noto">
          Create your restaurant account to start serving customers.
        </p>
        <div className="flex space-x-2">
          <div className="w-full space-y-1">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="bg-white p-2 rounded-lg w-full border-[0.5px] border-gray"
          />
          

          </div>
          <div className="w-full space-y-1">
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
          className="bg-white p-2 rounded-lg w-full border-[0.5px] border-gray"
        />
        </div>
      </div>
    </div>
      <div className="flex flex-col justify-center items-center">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="912345678"
          required
          className="bg-white p-2 rounded-lg w-full border-[0.5px] border-gray "
        />
      </div>
      <div className="flex space-x-2">
      <div className="w-full space-y-1">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Strong@password123"
          required
          className="bg-white p-2 rounded-lg w-full border-[0.5px] border-gray "
        />
      </div>

      <div className="w-full space-y-1">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Strong@password123"
          required
          className="bg-white p-2 rounded-lg w-full border-[0.5px] border-gray"
        />
      </div>
      </div>

      <div className="flex space-x-24">
        <button
          type="button"
          className={` p-2 rounded-lg w-[100px] border-[0.5px] border-gray hover:bg-lightGray ${
            formData.role === "owner"
              ? "bg-black text-white hover:bg-primary"
              : "bg-white text-black"
          }`}
          onClick={() => setFormData({ ...formData, role: "owner" })}
        >
          Owner
        </button>
        <button
          type="button"
          className={` p-2 rounded-lg w-[100px] border-[0.5px] border-gray hover:bg-lightGray ${
            formData.role === "manager"
              ? "bg-black text-white hover:bg-primary"
              : "bg-white text-black"
          }`}
          onClick={() => setFormData({ ...formData, role: "manager" })}
        >
          Manager
        </button>
      </div>

      {error && error !== "" ? <p className="text-red-500">{error}</p> : null}

      <button
        type="submit"
        className="bg-white text-black hover:bg-black hover:text-white transform duration-200 p-2 rounded-lg w-[100px] font-bold border-[0.5px] border-gray"
      >
        Sign Up
      </button>

      <p className="text-[13px] text-gray-800 flex self-end">
        Already have an account? &nbsp;{" "}
        <Link to="/login" className="underline font-semibold hover:font-bold">
          Login
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
