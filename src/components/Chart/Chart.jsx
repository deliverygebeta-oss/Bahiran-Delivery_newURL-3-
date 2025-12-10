import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import useUserStore from '../../Store/UseStore';
import Card from '../Cards/Cards';
const Chart = () => {


    const { orders } = useUserStore();

    const monthlyData = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        const monthlyStats = {};

        orders.forEach((order) => {
            const orderDate = new Date(order?.createdAt || order?.orderDate || Date.now());
            // Example: "Nov 2025"
            const monthYearKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!monthlyStats[monthYearKey]) {
                monthlyStats[monthYearKey] = {
                    month: orderDate.toLocaleDateString('en-US', { month: 'short' }),
                    revenue: 0,
                    sortKey: new Date(orderDate.getFullYear(), orderDate.getMonth(), 1).getTime(),
                };
            }

            monthlyStats[monthYearKey].revenue += Number((order?.totalFoodPrice || 0).toFixed(0));
        });

        // Return last 6 months sorted ascending
        return Object.values(monthlyStats)
            .sort((a, b) => a.sortKey - b.sortKey)
            .slice(-6)
            .map(({ month, revenue }) => ({ month, revenue }));
    }, [orders]);
    return ( 
        <>
        <div className="w-[400px] h-[300px] lg:w-[800px] lg:h-[500px]  p-2 bg-white border border-[#e0cda9] sm:mt-10 rounded-lg font-noto">
      <h2 style={{ textAlign: 'center' }}>Website Analytics Dashboard</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => ` ${value}`} />
          <Tooltip formatter={(value) => `~ ${value} ETB`} />
          <Legend />
          
          <Line 
            type="bump" 
            dataKey="revenue" 
            name="Revenue"
            stroke="#000000" 
            strokeWidth={3}
          />
          
        </LineChart>
      </ResponsiveContainer>
    </div>


        </> 
    );
}
 
export default Chart;