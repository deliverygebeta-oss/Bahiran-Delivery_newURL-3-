import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import useAdminDataStore from '../../Store/UseAdminDataStore';
import Card from '../Cards/Cards';
const AChart = () => {


    const { users, restaurants, fetchUsers, fetchRestaurants } = useAdminDataStore();
    const [activeChart, setActiveChart] = useState('users'); // 'users' | 'restaurants' | 'revenue'

    useEffect(() => {
        if (!users || users.length === 0) {
            fetchUsers();
        }
        if (!restaurants || restaurants.length === 0) {
            fetchRestaurants();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildMonthlyCounts = (items, getDate) => {
        if (!Array.isArray(items) || items.length === 0) return [];
        const stats = {};
        items.forEach((item) => {
            const date = getDate(item);
            if (!date) return;
            const monthYearKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            if (!stats[monthYearKey]) {
                stats[monthYearKey] = {
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    sortKey: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
                    count: 0,
                };
            }
            stats[monthYearKey].count += 1;
        });
        return Object.values(stats)
            .sort((a, b) => a.sortKey - b.sortKey)
            .slice(-6)
            .map(({ month, count }) => ({ month, count }));
    };

    const usersMonthly = useMemo(() => {
        return buildMonthlyCounts(users, (u) => {
            const d = u?.createdAt || u?.created_at || u?.registrationDate || null;
            return d ? new Date(d) : null;
        });
    }, [users]);

    const restaurantsMonthly = useMemo(() => {
        return buildMonthlyCounts(restaurants, (r) => {
            const d = r?.createdAt || r?.created_at || r?.openingDate || null;
            return d ? new Date(d) : null;
        });
    }, [restaurants]);

	const usersMonthlyStacked = useMemo(() => {
		if (!Array.isArray(users) || users.length === 0) return [];
		const stats = {};
		users.forEach((u) => {
			const d = u?.createdAt || u?.created_at || u?.registrationDate || null;
			const date = d ? new Date(d) : null;
			if (!date) return;
			const monthYearKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			if (!stats[monthYearKey]) {
				stats[monthYearKey] = {
					month: date.toLocaleDateString('en-US', { month: 'short' }),
					sortKey: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
					manager: 0,
					delivery: 0,
					customer: 0,
				};
			}
			const role = String(u?.role || '').toLowerCase();
			if (role.includes('manager')) stats[monthYearKey].manager += 1;
			else if (role.includes('delivery')) stats[monthYearKey].delivery += 1;
			else if (role.includes('customer')) stats[monthYearKey].customer += 1;
			// admins/others are ignored for this chart per requirement
		});
		return Object.values(stats)
			.sort((a, b) => a.sortKey - b.sortKey)
			.slice(-6)
			.map(({ month, manager, delivery, customer }) => ({ month, manager, delivery, customer }));
	}, [users]);

    return ( 
        <>
        <div className=" w-[600px] h-[400px] md:w-[800px] md:h-[500px] p-2 bg-white border border-[#e0cda9] sha rounded-lg font-noto ">
            <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-center w-full md:w-auto font-semibold">Admin Analytics </h2>
                <div className="hidden md:flex gap-2">
                    <button
                        onClick={() => setActiveChart('users')}
                        className={`px-3 py-1 rounded-md text-sm border ${activeChart === 'users' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveChart('restaurants')}
                        className={`px-3 py-1 rounded-md text-sm border ${activeChart === 'restaurants' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                    >
                        Restaurants
                    </button>
                    <button
                        onClick={() => setActiveChart('revenue')}
                        className={`px-3 py-1 rounded-md text-sm border ${activeChart === 'revenue' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                    >
                        Revenue
                    </button>
                </div>
            </div>
            <div className="flex md:hidden gap-2 mb-2 justify-center">
                <button
                    onClick={() => setActiveChart('users')}
                    className={`px-3 py-1 rounded-md text-sm border ${activeChart === 'users' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveChart('restaurants')}
                    className={`px-3 py-1 rounded-md text-sm border ${activeChart === 'restaurants' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                >
                    Restaurants
                </button>
                <button
                    onClick={() => setActiveChart('revenue')}
                    className={`px-3 py-1 rounded-md text-sm border ${activeChart === 'revenue' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                >
                    Revenue
                </button>
            </div>
			{activeChart === 'users' ? (
				<ResponsiveContainer width="100%" height="85%">
					<AreaChart
						data={usersMonthlyStacked}
						margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
					>
					       <CartesianGrid strokeDasharray="3 3" stroke="#333" />
					       <XAxis dataKey="month" />
					       <YAxis />
					       <Tooltip />
					       <Legend />
					       <Area type="monotone" dataKey="manager" name="Managers" stackId="1" stroke="#1f77b4" fill="#1f77b4" fillOpacity={0.25} />
					       <Area type="monotone" dataKey="delivery" name="Delivery" stackId="1" stroke="#2ca02c" fill="#2ca02c" fillOpacity={0.25} />
					       <Area type="monotone" dataKey="customer" name="Customers" stackId="1" stroke="#ff7f0e" fill="#ff7f0e" fillOpacity={0.25} />
					</AreaChart>
				</ResponsiveContainer>
			) : activeChart === 'restaurants' ? (
				<ResponsiveContainer width="100%" height="85%">
					<LineChart
						data={restaurantsMonthly}
						margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#333"/>
						<XAxis dataKey="month" />
						<YAxis tickFormatter={(value) => `${value}`} />
						<Tooltip formatter={(value) => `${value}`} />
						<Legend />
						<Line type="monotone" dataKey="count" name="Restaurants" stroke="#000000" strokeWidth={3} />
					</LineChart>
				</ResponsiveContainer>
			) : (
                <div className="w-full h-[85%] flex items-center justify-center">
                    <p className="text-sm text-placeholderText">Revenue growth - Coming soon</p>
                </div>
            )}
        </div>


        </> 
    );
}
 
export default AChart;