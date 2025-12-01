import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { InlineLoadingDots } from '../Loading/Loading';
import OtpVerificationForm from './OTPform';
const ForgotPasswordForm = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!phone) {
      setError("Phone number is required");
      return;
    } else if (phone.length !== 9) {
      setError("Phone number must be 9 digits");
      return;
    } else {
      setError("");
    }
    // console.log(phone)

    try {
      const response = await axios.post('https://gebeta-delivery1.onrender.com/api/v1/users/requestResetOTP', {
        phone: phone,
      });

      setMessage(response.data.message || 'Reset link sent to your email');
      setError('');

      response.data.status === "success" && setShowOtpForm(false);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || 'Something went wrong.');
      setMessage('');
    }
    // console.log(response.data)
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div 
         className={`space-y-4 bg-cardBackground p-8 rounded-lg shadow-lg w-[370px] flex flex-col items-center gap-12 border min-h-[250px] border-gray font-noto ${!showOtpForm ? "hidden" : ""}`}
        >
        <div className="w-full space-y-3 flex flex-col">
          <h2 className="text-xl font-bold">Forgot Password</h2>

          <input
            type="text"
            name="phone"
            value={phone}
            onChange={(e) => {
              const sanitizedPhone =
                e.target.value.startsWith("0")
                  ? e.target.value.slice(1)
                  : e.target.value;
              setPhone(sanitizedPhone)
            }}
            placeholder="912345678"
            required
            className="bg-white border-[0.5px] border-gray p-2 rounded-lg w-full"
          />
          <p className="text-[13px] text-gray-600 flex self-end">Return to &nbsp; <Link to="/login" className="underline font-semibold hover:font-bold">Login</Link></p>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}

        <button type="submit" className=" bg-[#deb770] text-white font-semibold p-2 hover:bg-[#deb770] hover:text-white transform duration-200 rounded-lg  border border-gray">
          {loading ? <InlineLoadingDots /> : <span>Send Reset Link</span>}
        </button>

        </div>
      {!showOtpForm && <OtpVerificationForm phone={phone} setShowOtpForm={setShowOtpForm} />}
      </form>
    </>
  );
};

export default ForgotPasswordForm;
