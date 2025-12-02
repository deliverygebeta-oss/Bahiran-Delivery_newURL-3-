import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useRef } from "react";
import { InlineLoadingDots } from "../Loading/Loading";

const VerifyForm = ({ phone }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const inputRefs = useRef([]);
    console.log(phone);

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) {
            setError("Please complete all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
                "https://api.bahirandelivery.cloud/api/v1/users/verifyOTP",
                {
                    phone: phone,
                    code: code,
                }
            );
            console.log(res.data);

            if(res.data.status === "success"){

                setMessage(res.data.message || "OTP verified successfully");

            }
            setError("");
            const role = sessionStorage.getItem("user-data").state.user.role;
            if (role !== "Admin") {
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (err) {
            if(res.data.status !== "success"){
                console.log(err);
                setError(res.data.status !== "success" ? res.data.message : "Invalid or expired OTP");

            }
            setMessage("");
        } finally {
            setLoading(false);
            // setShowVerifyForm(true);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-8 flex flex-col items-center gap-12 min-h-[250px]  font-noto motion-preset-fade ">
            <h2 className="text-xl font-bold">Verify OTP</h2>
            <p className="text-sm">
                Please enter the 6-digit OTP sent to {phone || "your registered phone number"}
            </p>
            <div className="flex items-center justify-center gap-2">
                {otp.map((item, index) => (
                    <input
                        key={index}
                        type="text"
                        value={item}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => (inputRefs.current[index] = el)}
                        maxLength={1}
                        className="w-[40px] h-[40px] bg-gray-200 rounded-lg border border-gray-300 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <button
                type="submit"
                className={`bg-[#deb770] text-white font-bold py-2 px-4 rounded ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={loading}
            >
                {loading ? <InlineLoadingDots /> : "Verify"}
            </button>
        </form>
    );
};

export default VerifyForm;