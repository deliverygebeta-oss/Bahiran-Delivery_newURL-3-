import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OtpVerificationForm = ({ phone, setShowOtpForm }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // for 6-digit OTP
  // const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Handle Enter key to submit
    if (event.key === "Enter" && index === otp.length - 1) {
      handleSubmit(event);
    }
  };

  const handleSubmit = async (e) => {
    // No need for e.preventDefault() since no <form>
    e?.preventDefault?.();

    const code = otp.join("");
    if (code.length !== 6 || !phone || !password || !passwordConfirm) {
      setError("Please complete all fields");
      return;
    }
    if(password !== passwordConfirm){
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "https://api.bahirandelivery.cloud/api/v1/users/resetPasswordOTP",
        {
          phone,
          code,
          password,
          passwordConfirm,
        }
      );
      console.log(res);
      res.data.status === "success" && navigate("/login");
      
      setMessage(res.data.message || "OTP verified successfully");
      setError("");
    } catch (err) {
      // console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "Invalid or expired OTP");
      setMessage("");
    }
    // console.log(res.data)
  };

  const handleResend = async () => {
    if (!phone) {
      setError("Phone number is required");
      return;
    }
    try {
      const res = await axios.post(
        "https://api.bahirandelivery.cloud/api/v1/users/requestResetOTP",
        { phone } // assuming the phone is needed
      );
      setMessage(res.data.message || "OTP resent");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
      setMessage("");
    }
  };

  return (
    <div
      className="space-y-1 bg-cardBackground p-8 rounded-lg shadow-lg w-[370px] flex flex-col items-center gap-3 border border-gray font-noto"
    >
      <h2 className="text-xl font-bold">Reset Password</h2>
      <h3 className="text-sm text-gray-600">Enter the 6-digit OTP sent to {phone}</h3>

      {/* Phone Input */}
      {/* <div className="w-full">
        <label className="block mb-1">Phone Number:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="912345678"
          className="w-full border border-gray rounded-lg px-3 py-2"
        />
      </div> */}

      {/* OTP */}
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            className="w-10 h-10 text-center border border-gray rounded-lg text-lg"
          />
        ))}
      </div>

      {/* Password Inputs */}
      <div className="w-full">
        <label className="block mb-1">New Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray rounded-lg px-3 py-2"
        />
      </div>
      <div className="w-full">
        <label className="block mb-1">Confirm Password:</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full border border-gray rounded-lg px-3 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />
      </div>

      {/* Error & Message */}
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-black text-white py-2 px-6 rounded-lg hover:opacity-90"
      >
      Reset Password
      </button>

      {/* Resend */}
      <p
        onClick={handleResend}
        className="text-sm text-gray-600 hover:underline cursor-pointer"
      >
        Resend OTP
      </p>
    </div>
  );
};

export default OtpVerificationForm;