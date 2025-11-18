import PopupCard from "./Cards/PopupCard";
import { useState, useEffect } from "react";
import useUserStore from "../Store/UseStore";


const FirstLogin = () => {
    const [show, setShow] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [SetInput, setSetInput] = useState(true);
    const [address, setAddress] = useState("");
    const { user, setUserFirstLogin } = useUserStore();
    // console.log(user?.firstLogin);

    // Get managerId from sessionStorage, handle missing/null
    let restaurantId = null;
    try {
        const userData = JSON.parse(sessionStorage.getItem("user-data"));
        restaurantId = userData?.state.restaurant?.id
        // console.log(userData?.state.restaurant?.id);
    } catch (e) {
        restaurantId = null;
    }

    // console.log(managerId);

    // Handler for "Set" button
    const handleSetLocation = () => {
        setErrorMsg("");
        setSuccessMsg("");
        if (!navigator.geolocation) {
            setErrorMsg("Geolocation is not supported by your browser.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Prepare JSON payload for location
                const payload = {
                    address: address,
                    latitude: latitude,
                    longitude: longitude,

                };
                console.log(latitude, longitude);
                console.log(payload);
                // if (form.location.coordinates.length === 2) {
                //       formData.append("location[coordinates][0]", form.location.coordinates[0]);
                //       formData.append("location[coordinates][1]", form.location.coordinates[1]);
                //     }

                try {
                    const res = await fetch(
                        `https://gebeta-delivery1.onrender.com/api/v1/restaurants/location/${restaurantId}`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify(payload),
                        }
                    );
                    const result = await res.json();
                    console.log(res)

                    if (res.ok && result.status === "success") {
                        setSuccessMsg("Location updated successfully!");
                        setTimeout(() => setShow(false), 1200);
                        setUserFirstLogin(false);


                    } else {
                        setErrorMsg(result.message || "Failed to update location.");
                    }
                } catch (err) {
                    setErrorMsg("Failed to update location. Please try again.");
                }
                setLoading(false);
            },
            (error) => {
                setLoading(false);
                setErrorMsg("Failed to capture location. Please ensure location services are enabled.");
            },
            { enableHighAccuracy: true }
        );
    };
    // setUserFirstLogin(false);    


    useEffect(() => {
        const id = setTimeout(() => {
            setShow(true);
        }, 250000);
        return () => clearTimeout(id);
    }, []);

    // Handler for "Remind me later"
    const handleLater = () => {
        setShow(false);
        setUserFirstLogin(false);
    };

    // Don't show popup if dismissed or no managerId
    if (!show || !restaurantId) return null;

    return (
        <PopupCard>
            <div className="flex flex-col self-start justify-start">
                <h1 className="text-2xl text-gray-800">
                    <span>
                        {"Welcome".split("").map((char, i) => (
                            <span
                                key={i}
                                className="inline-block animate-bounce text-[#deb770] font-extrabold hover:text-blue-400 cursor-none"
                                style={{
                                    animationDelay: `${i * 0.6}s`,
                                    animationDuration: "2s",
                                }}
                            >
                                {char}
                            </span>
                        ))}
                    </span>{" "}
                    to Gebeta Delivery Management Dashboard!!
                </h1>
                <div className="flex flex-col self-center justify-start p-3 rounded-lg ">
                    <label htmlFor="firstLogin" className="mb-2">
                        Set your current location as your restaurant's location
                    </label>
                    <div className="flex flex-row self-center gap-2">


                        {!SetInput && <div className="motion-preset-pop  flex gap-4">
                            <input type="text" placeholder="Address" className="bg-white p-2 rounded-lg w-full border border-gray-900" value={address} onChange={(e) => setAddress(e.target.value)} />
                            <button
                                className="bg-[#deb770] text-white p-2 rounded-lg disabled:opacity-60"
                                onClick={handleSetLocation}
                                disabled={loading}
                            >
                                {loading ? "Setting..." : "Set"}
                            </button>
                        </div>
                        }

                        {SetInput && <>
                            <button
                                className="bg-[#deb770] text-white p-2 rounded-lg disabled:opacity-60"
                                onClick={() => setSetInput(false)}
                                disabled={loading}
                            >
                                {loading ? "Setting..." : "Set"}
                            </button>
                            <button
                                className="bg-[#deb770] text-white p-2 rounded-lg"
                                onClick={handleLater}
                                disabled={loading}
                            >
                                Remind me later
                            </button>
                        </>}
                    </div>
                    {errorMsg && (
                        <div className="text-red-600 text-sm mt-2">{errorMsg}</div>
                    )}
                    {successMsg && (
                        <div className="text-green-600 text-sm mt-2">{successMsg}</div>
                    )}
                </div>
            </div>
        </PopupCard>
    );
};

export default FirstLogin;