import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UseUserStore from "../../Store/UseStore";
import { InlineLoadingDots } from "../Loading/Loading";
import { Eye, EyeOff } from "lucide-react";
import VerifyForm from "./VerifyForm";

const LoginForm = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMg, setErrorMg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);

  const navigate = useNavigate();
  const { setUser, setRestaurant, setOrders } = UseUserStore();

  const fetchManagerRestaurant = async (authToken) => {
    const res = await fetch(
      "https://api.bahirandelivery.cloud/api/v1/restaurants/by-manager",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      throw new Error(data.message || "Failed to load restaurants.");
    }

    const restaurant = data.data?.restaurants?.[0] || null;
    setRestaurant(restaurant);
    return restaurant;
  };

  const fetchManagerOrders = async (authToken, restaurantId) => {
    if (!restaurantId) {
      throw new Error("No restaurant assigned to this manager.");
    }

    const res = await fetch(
      `https://api.bahirandelivery.cloud/api/v1/orders/restaurant/${restaurantId}/orders`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to load orders.");
    }

    setOrders(Array.isArray(data?.data) ? data.data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!phone || !password) {
      setErrorMg("All fields are required");
      return;
    } else {
      setErrorMg(""); // Clear previous errors
    }

    try {
      setLoading(true);
      const res = await fetch(
        "https://api.bahirandelivery.cloud/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone, password }),
        }
      );
      const data = await res.json();
      // console.log(data);
      // console.log(res.ok);

      if (!res.ok) {
        if(data.message === "Invalid credentials"){
          setErrorMg("Incorrect phone number or password");
        }else{
          setErrorMg("Login failed check your internet connection");
        }
        throw new Error(data.message || "Login failed check your internet connection");
      }

      // if (data.data?.message?.includes("OTP sent to your")) {
      //   setShowVerifyForm(true);
      //   return;
      // }

      // if (!data.data.user) {
      //   // Fallback for unexpected response structure
      //   setShowVerifyForm(true);
      //   return;
      // } 
      else {
        const authenticatedUser = data.data?.user;
        const authToken = data.token;

        if (!authenticatedUser || !authToken) {
          throw new Error("Invalid response from server");
        }

        localStorage.setItem("token", authToken);
        setUser(authenticatedUser);

        if (authenticatedUser.role === "Manager") {
          const managerRestaurant = await fetchManagerRestaurant(authToken);
          await fetchManagerOrders(authToken, managerRestaurant?.id);
          navigate("/managerDashboard");
        } else if (authenticatedUser.role === "Admin") {
          navigate("/adminDashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setErrorMg(error.message === "Invalid credentials" ? "Incorrect phone number or password" : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`space-y-4 bg-[#f5f5f5] p-8 rounded-lg shadow-lg w-[370px] flex flex-col justify-self-center items-center mt-[20px] border border-gray font-noto ${
          showVerifyForm ? "hidden" : ""
        }`}
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <p className="text-[13px] text-gray-500 text-center">Welcome back!</p>

        <div className="w-full space-y-1">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="text"
            name="phone"
            value={phone}
            onChange={(e) => {
              const sanitizedPhone =
                e.target.value.startsWith("0")
                  ? e.target.value.slice(1)
                  : e.target.value;
              setPhone(sanitizedPhone);
            }}
            placeholder="912345678"
            required
            className="bg-white border-[0.5px] border-gray p-2 rounded-md w-full text-black"
          />
        </div>

        <div className="w-full space-y-1">
          <label htmlFor="password">Password:</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              required
              className="bg-white border-[0.5px] border-gray p-2 rounded-md w-full text-black pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Link
          to="/forgot-password"
          className="flex -translate-x-5 -translate-y-3 self-end hover:underline hover:text-black text-[13px] text-gray-500"
        >
          Forgot Password?
        </Link>

        {errorMg && <p className="text-red-500 text-sm">{errorMg}</p>}

        <button
          type="submit"
          className={`bg-white flex items-center justify-center transform duration-200 text-gray-800 font-bold py-2 px-4 rounded-md w-[100px] hover:bg-black hover:text-white border-[0.5px] border-gray ${
            loading ? "cursor-not-allowed opacity-50 hover:bg-white" : ""
          }`}
        >
          {loading ? <InlineLoadingDots /> : "Log In"}
        </button>

        <p className="text-[13px] text-gray-800 flex self-end">
          {/* Don't have an account? &nbsp;
          <Link to="/signup" className="underline font-semibold hover:font-bold">
            Sign Up
          </Link> */}
        </p>
      </div>
      {showVerifyForm && <VerifyForm phone={phone} />}
    </form>
  );
};

export default LoginForm;