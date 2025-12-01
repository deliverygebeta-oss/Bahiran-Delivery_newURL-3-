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
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-5">
                    <div>
                        <h2 className="text-xl font-bold">Top 5 Restaurants</h2>
                        <p className="text-sm text-placeholderText mb-2 sm:mb-0">
                            Most ordered restaurants
                        </p>
                    </div>
                </div>

                {loading && <p className="text-sm text-placeholderText py-4">Loading...</p>}
                {error && <p className="text-sm text-red-500 py-4">{error}</p>}

                {!loading && !error && (
                    topFive.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-placeholderText">No data available</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 px-4 py-4 md:max-h-[350px] md:overflow-y-auto">
                            {topFive.map((r, index) => {
                                const name = r?.restaurantName || "Unknown Restaurant";
                                const initial = name?.[0]?.toUpperCase() || "?";
                                const total = Number(
                                    r?.adjustedTotal ?? (
                                        Number(r?.totalOrders || 0) - Number(r?.byStatus?.Cancelled || 0)
                                    )
                                );

                                return (
                                    <div
                                        key={r.restaurantId || `${name}-${index}`}
                                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full border border-gray bg-cardBackground text-gray-700 text-xl font-bold">
                                                    {initial}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm sm:text-base font-semibold">{name}</p>
                                                <p className="text-xs sm:text-sm text-placeholderText leading-tight">
                                                    Pending: {r?.byStatus?.Pending || 0} • Preparing: {r?.byStatus?.Preparing || 0} • Completed: {r?.byStatus?.Completed || 0}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <span className="font-semibold text-xs sm:text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                                {total} orders
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </Card>
        </div>
    );
};

export default Top5Restaurants;