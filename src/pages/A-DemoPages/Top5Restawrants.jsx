import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Cards/Cards";

const Top5Restaurants = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTopRestaurants = async () => {
            setLoading(true);
            setError("");
            try {
                const base = "https://gebeta-delivery1.onrender.com";
                const res = await fetch(
                    `${base}/api/v1/orders/restaurants/order-stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const json = await res.json();
                if (!res.ok) {
                    throw new Error(json?.message || "Failed to load restaurant stats");
                }
                const list = Array.isArray(json?.data) ? json.data : [];
                setStats(list);
            } catch (e) {
                setError(e.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchTopRestaurants();
    }, []);

    const topFive = useMemo(() => {
        const list = Array.isArray(stats) ? stats : [];
        const withAdjustedTotals = list.map((r) => {
            const cancelled = Number(r?.byStatus?.Cancelled || 0);
            const total = Number(r?.totalOrders || 0);
            const adjustedTotal = Math.max(0, total - cancelled);
            return { ...r, adjustedTotal };
        });
        return withAdjustedTotals
            .sort((a, b) => (Number(b?.adjustedTotal || 0) - Number(a?.adjustedTotal || 0)))
            .slice(0, 5);
    }, [stats]);
    console.log(topFive);

    return ( 
        <div className="font-noto">
            <Card>
                <h2 className="text-xl font-bold">Top 5 Restaurants</h2>
                <p className="text-sm text-placeholderText mb-2">
                   Most ordered restaurants
                </p>
                {loading && <p className="text-sm text-placeholderText">Loading...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {!loading && !error && (topFive.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-placeholderText">No data available</p>
                    </div>
                ) : (
                    <>
                        {topFive.map((r, index) => {
                            const name = r?.restaurantName || "Unknown Restaurant";
                            const initial = name?.[0] || "?";
                            const total = Number(r?.adjustedTotal ?? (Number(r?.totalOrders || 0) - Number(r?.byStatus?.Cancelled || 0)));
                            return (
                                <Card
                                    key={r.restaurantId || name || index}
                                    className="px- py-[2px] border-b border-gray flex items-center justify-between gap-5"
                                >
                                    <div className="motion-preset-bounce motion-duration-300 text-left flex gap-2 px-1">
                                        <div>
                                            <div className="px-4 py-2 text2xl text-gray-400 pb-1 w-[50px] h-[50px] flex items-center justify-center  border-gray border rounded-full bg-cardBackground motion-preset-bounce motion-duration-300 font-poppins font-bold">
                                                {initial}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm">{name}</p>
                                            <p className="text-xs text-placeholderText">
                                                Pending: {r?.byStatus?.Pending || 0} • Preparing: {r?.byStatus?.Preparing || 0} • Completed: {r?.byStatus?.Completed || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="">
                                        <span className="font-semibold text-xs flex place-self-end p-1 px-2 rounded-full ml-8 motion-preset-bounce bg-blue-100 text-blue-700">
                                            {total} orders
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </>
                ))}
            </Card>
        </div>
     );
}
 
export default Top5Restaurants;