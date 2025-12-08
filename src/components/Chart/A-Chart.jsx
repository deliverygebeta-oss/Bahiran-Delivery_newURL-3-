import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import useAdminDataStore from '../../Store/UseAdminDataStore';

const AChart = () => {
    const { users, restaurants, fetchUsers, fetchRestaurants } = useAdminDataStore();
    const [activeChart, setActiveChart] = useState("users");

    useEffect(() => {
        if (!users || users.length === 0) fetchUsers();
        if (!restaurants || restaurants.length === 0) fetchRestaurants();
    }, []);

    // Build monthly totals
    const buildMonthlyCounts = (items, getDate) => {
        if (!Array.isArray(items) || items.length === 0) return [];

        const stats = {};

        items.forEach((item) => {
            const date = getDate(item);
            if (!date) return;

            const y = date.getFullYear();
            const m = date.getMonth() + 1;
            const key = `${y}-${String(m).padStart(2, "0")}`;

            stats[key] = (stats[key] || 0) + 1;
        });

        const keys = Object.keys(stats);
        if (keys.length === 0) return [];

        let maxTime = 0;
        keys.forEach((key) => {
            const [y, m] = key.split("-").map(Number);
            const t = new Date(y, m - 1, 1).getTime();
            if (t > maxTime) maxTime = t;
        });

        const maxDate = new Date(maxTime);
        const months = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;

            const key = `${y}-${String(m).padStart(2, "0")}`;
            months.push({
                month: d.toLocaleString("en-US", { month: "short" }),
                count: stats[key] || 0,
            });
        }

        return months;
    };

    // Build user role counts
    const buildMonthlyUserRoles = (items) => {
        if (!Array.isArray(items) || items.length === 0) return [];

        const stats = {};

        items.forEach((u) => {
            const d = u?.createdAt || u?.created_at || u?.registrationDate;
            if (!d) return;

            const date = new Date(d);
            const y = date.getFullYear();
            const m = date.getMonth() + 1;
            const key = `${y}-${String(m).padStart(2, "0")}`;

            if (!stats[key]) {
                stats[key] = { manager: 0, delivery: 0, customer: 0 };
            }

            const role = String(u.role || "").toLowerCase();
            if (role.includes("manager")) stats[key].manager++;
            else if (role.includes("delivery")) stats[key].delivery++;
            else if (role.includes("customer")) stats[key].customer++;
        });

        const keys = Object.keys(stats);
        if (keys.length === 0) return [];

        let maxTime = 0;
        keys.forEach((key) => {
            const [y, m] = key.split("-").map(Number);
            const t = new Date(y, m - 1, 1).getTime();
            if (t > maxTime) maxTime = t;
        });

        const maxDate = new Date(maxTime);
        const months = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const key = `${y}-${String(m).padStart(2, "0")}`;

            const roleData = stats[key] || { manager: 0, delivery: 0, customer: 0 };

            months.push({
                month: d.toLocaleString("en-US", { month: "short" }),
                manager: roleData.manager,
                delivery: roleData.delivery,
                customer: roleData.customer,
            });
        }

        return months;
    };

    // Build data
    const usersMonthly = useMemo(
        () => buildMonthlyCounts(users, (u) => new Date(u.createdAt)),
        [users]
    );

    const restaurantsMonthly = useMemo(
        () => buildMonthlyCounts(restaurants, (r) => new Date(r.createdAt)),
        [restaurants]
    );

    const userRoleMonthly = useMemo(() => buildMonthlyUserRoles(users), [users]);

    return (
        <div className="w-full max-w-[800px] h-auto min-h-[400px] md:min-h-[500px] p-4 bg-white border border-[#e0cda9] shadow-lg rounded-lg font-noto mx-auto">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2 px-2">
                <h2 className="text-xl font-semibold text-center md:text-left">Admin Analytics</h2>

                <div className="flex gap-2 flex-wrap justify-center md:justify-end">
                    <button
                        onClick={() => setActiveChart("users")}
                        className={`px-4 py-2 rounded-md text-sm border font-medium ${
                            activeChart === "users"
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                        Users
                    </button>

                    <button
                        onClick={() => setActiveChart("restaurants")}
                        className={`px-4 py-2 rounded-md text-sm border font-medium ${
                            activeChart === "restaurants"
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                        Restaurants
                    </button>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="w-full h-[380px] md:h-[450px]">

                {/* USERS AREA CHART (non-stacked) */}
                {activeChart === "users" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userRoleMonthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Legend />

                            {/* Managers (Blue Area) */}
                            <Area
                                type="monotone"
                                dataKey="manager"
                                name="Managers"
                                stroke="#1f77b4"
                                fill="#1f77b4"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />

                            {/* Delivery (Green Area) */}
                            <Area
                                type="monotone"
                                dataKey="delivery"
                                name="Delivery"
                                stroke="#2ca02c"
                                fill="#2ca02c"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />

                            {/* Customers (Orange Area) */}
                            <Area
                                type="monotone"
                                dataKey="customer"
                                name="Customers"
                                stroke="#ff7f0e"
                                fill="#ff7f0e"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}

                {/* RESTAURANT LINE CHART */}
                {activeChart === "restaurants" && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={restaurantsMonthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="count"
                                name="Restaurants"
                                stroke="#000"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default AChart;
