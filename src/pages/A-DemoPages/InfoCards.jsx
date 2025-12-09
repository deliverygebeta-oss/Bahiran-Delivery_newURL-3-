import { ChartNoAxesCombined, ShoppingCart, BarChart2, Utensils, TrendingUp } from "lucide-react";
import Card from "../../components/Cards/Cards";
import { useEffect, useMemo, useState } from "react";
import useAdminDataStore from "../../Store/UseAdminDataStore";

const AInfoCards = () => {
    const {
        users,
        restaurants,
        fetchUsers,
        fetchRestaurants,
    } = useAdminDataStore();

    const [ordersTotal, setOrdersTotal] = useState(0);
    const [ordersByType, setOrdersByType] = useState({ delivery: 0, takeaway: 0, dinein: 0 });

    useEffect(() => {
        if (!users || users.length === 0) {
            fetchUsers();
        }
        if (!restaurants || restaurants.length === 0) {
            fetchRestaurants();
        }
    }, [users, restaurants, fetchUsers, fetchRestaurants]);

    useEffect(() => {
        const fetchOrderStats = async () => {
            try {
                const base = "https://api.bahirandelivery.cloud/"

                const res = await fetch(
                    `${base}/api/v1/orders/restaurants/order-stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const json = await res.json();
                if (!res.ok) throw new Error(json?.message || "Failed to load stats");
                const list = Array.isArray(json?.data) ? json.data : [];
                const total = list
                    .map((r) => Number(r?.totalOrders || 0))
                    .reduce((sum, n) => sum + n, 0);
                setOrdersTotal(total);

                const byTypeTotals = list.reduce(
                    (acc, r) => {
                        const byType = r?.byType || {};
                        acc.delivery += Number(byType?.Delivery || 0);
                        acc.takeaway += Number(byType?.Takeaway || 0);
                        acc.dinein += Number(byType?.DineIn || 0);
                        return acc;
                    },
                    { delivery: 0, takeaway: 0, dinein: 0 }
                );
                setOrdersByType(byTypeTotals);

            } catch {
                setOrdersTotal(0);
                setOrdersByType({ delivery: 0, takeaway: 0, dinein: 0 });
            }
        };
        fetchOrderStats();
    }, []);

    const stats = useMemo(() => {
        const list = Array.isArray(users) ? users : [];

        const roleCounts = list.reduce((acc, user) => {
            const role = String(user?.role || "").toLowerCase();
            if (role.includes("admin")) acc.admin += 1;
            else if (role.includes("manager")) acc.manager += 1;
            else if (role.includes("delivery")) acc.delivery += 1;
            else if (role.includes("customer")) acc.customer += 1;
            else acc.other += 1;
            return acc;
        }, { admin: 0, manager: 0, delivery: 0, customer: 0, other: 0 });

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const newUsersThisMonth = list.reduce((count, user) => {
            const d = user?.createdAt || user?.created_at || user?.registrationDate;
            if (!d) return count;
            const created = new Date(d);
            if (!Number.isNaN(created.getTime()) && created >= monthStart && created <= now) {
                return count + 1;
            }
            return count;
        }, 0);

        return {
            roleItems: [
                { label: "Admin", count: roleCounts.admin },
                { label: "Manager", count: roleCounts.manager },
                { label: "Delivery", count: roleCounts.delivery },
                { label: "Customer", count: roleCounts.customer },
            ],
            usersByRoleText: `${roleCounts.admin} / ${roleCounts.manager} / ${roleCounts.delivery} / ${roleCounts.customer}`,
            // usersByRoleLegend: "admin / manager / delivery / customer",
            restaurantsCount: (restaurants || []).length,
            newUsersThisMonth,
        };
    }, [users, restaurants]);

    const CardInfo = [
        {
            label: "Total Revenue",
            num: "",
            icon: <ChartNoAxesCombined size={18} />,
            progress: "Coming soon",
        },
        {
            label: "Growth",
            num: stats.newUsersThisMonth?.toLocaleString?.() || stats.newUsersThisMonth || 0,
            icon: <TrendingUp size={18} />,
            progress: "New users this month",
        },
        {
            label: "Orders",
            num: ordersTotal?.toLocaleString?.() || ordersTotal,
            icon: <ShoppingCart size={18} />,
            progress: (
                <>
                    <div className="flex">
                        <div>

                            <span className="font-medium">Delivery</span> <span className="font-semibold text-lg text-gray-900">{ordersByType.delivery}</span>
                        </div>
                        <div>

                            <span className="font-medium">Takeaway</span> <span className="font-semibold text-lg text-gray-900">{ordersByType.takeaway}</span>
                        </div>
                        <div>

                            <span className="font-medium">Dine-in</span> <span className="font-semibold text-lg text-gray-900">{ordersByType.dinein}</span>
                        </div>
                    </div>
                </>
            ),
        },
        {
            label: "Users by Role",
            num: (
                <div className="flex items-center">
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            {stats.roleItems.slice(0, 2).map((r, idx) => (
                                <div key={r.label} className="flex items-center">
                                    <span className="text-sm md:text-md ">
                                        <span className="font-semibold p-1 rounded-full bg-gray-900 text-gray-100 py-0 text-xs md:text-sm">{r.count}</span> {r.label}
                                    </span>
                                    {idx < 1 && (
                                        <div className="w-px h-4 md:h-6 bg-gray-300 mx-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center mt-1">
                            {stats.roleItems.slice(2).map((r, idx) => (
                                <div key={r.label} className="flex items-center mb-">
                                    <span className="text-sm md:text-md ">
                                        <span className="font-semibold p-1 rounded-full bg-gray-900 text-gray-100 py-0 text-xs md:text-sm"><span>{r.count}</span></span> {r.label}
                                    </span>
                                    {idx < stats.roleItems.slice(2).length - 1 && (
                                        <div className="w-px h-2 bg-gray-300 mx-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
            icon: <BarChart2 size={18} />,
            progress: (
                <>
                    Total across roles: <span className="font-semibold text-lg text-gray-900">{users?.length ?? 0}</span>
                </>
            ),
        },
        {
            label: "Restaurants",
            num: stats.restaurantsCount?.toLocaleString?.() || stats.restaurantsCount,
            icon: <Utensils size={18} />,
            progress: "Total restaurants",
        },
    ];

    return (
        <>
            <div className="flex flex-wrap gap-2 md:justify-between font-noto mt-2 h-[180px]">
                {CardInfo.map((item, index) => (
                    <Card key={index}>
                        <div className="flex flex-col items-start md:h-[120px] md:w-[210px] gap-2">
                            <div>{item.icon}</div>
                            <h1 className="md:text-lg font-semibold">{item.label}</h1>
                            <div>{item.num}</div>
                            <p className="md:text-md text-placeholderText">{item.progress}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}

export default AInfoCards;