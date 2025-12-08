import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Minus } from "lucide-react";
import  useUserStore  from "../../Store/UseStore";

const Analytics = () => {

  const {orders} = useUserStore();

  // Calculate analytics from real orders data
  const calculateAnalytics = () => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        orderCount: 0,
        customerCount: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
        customerGrowth: 0,
        orderTypeCounts: { dineIn: 0, delivery: 0, takeAway: 0 },
        monthlyData: []
      };
    }

    // Keep only orders with a valid date
    const datedOrders = orders.filter(order => {
      const rawDate = order.createdAt || order.orderDate;
      if (!rawDate) return false;
      const orderDate = new Date(rawDate);
      return !isNaN(orderDate);
    });

    // Calculate total revenue and order count (all valid dated orders)
    const totalRevenue = datedOrders.reduce((sum, order) => sum + (order.totalFoodPrice || 0), 0);
    const orderCount = orders.length;

    // Calculate unique customers (assuming each order has a customer ID or email)
    const uniqueCustomers = new Set();
    datedOrders.forEach(order => {
      if (order.customerId) {
        uniqueCustomers.add(order.customerId);
      } else if (order.customerEmail) {
        uniqueCustomers.add(order.customerEmail);
      } else if (order.userId) {
        uniqueCustomers.add(order.userId);
      }
    });
    const customerCount = uniqueCustomers.size || orderCount; // Fallback to order count if no customer IDs

    // Count orders by type (dine-in, delivery, take away)
    const orderTypeCounts = orders.reduce((acc, order) => {
      const type = String(order.orderType || order.type || '').toLowerCase();
      if (type.includes('dine')) {
        acc.dineIn += 1;
      } else if (type.includes('deliver')) {
        acc.delivery += 1;
      } else if (type.includes('take')) {
        acc.takeAway += 1;
      }
      return acc;
    }, { dineIn: 0, delivery: 0, takeAway: 0 });

    // Group orders by month for charts
    const monthlyStats = {};
    
    datedOrders.forEach(order => {
      const rawDate = order.createdAt || order.orderDate;
      if (!rawDate) return;
      const orderDate = new Date(rawDate);
      if (isNaN(orderDate)) return;
      const monthYearKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthYearKey]) {
        monthlyStats[monthYearKey] = {
          month: orderDate.toLocaleDateString('en-US', { month: 'short' }),
          revenue: 0,
          orders: 0,
          customers: new Set(),
          sortKey: new Date(orderDate.getFullYear(), orderDate.getMonth(), 1).getTime()
        };
      }
      
      monthlyStats[monthYearKey].revenue += order.totalFoodPrice || 0;
      monthlyStats[monthYearKey].orders += 1;
      
      if (order.customerId) {
        monthlyStats[monthYearKey].customers.add(order.customerId);
      } else if (order.customerEmail) {
        monthlyStats[monthYearKey].customers.add(order.customerEmail);
      } else if (order.userId) {
        monthlyStats[monthYearKey].customers.add(order.userId);
      }
    });

    // Convert to array and sort by year-month
    const monthlyData = Object.values(monthlyStats)
      .map(month => ({
        ...month,
        customers: month.customers.size
      }))
      .sort((a, b) => a.sortKey - b.sortKey);

    // Calculate growth rates (simplified - comparing last month to previous)
    const revenueGrowth = monthlyData.length >= 2 
      ? ((monthlyData[monthlyData.length - 1].revenue - monthlyData[monthlyData.length - 2].revenue) / monthlyData[monthlyData.length - 2].revenue * 100)
      : 0;
    
    const orderGrowth = monthlyData.length >= 2 
      ? ((monthlyData[monthlyData.length - 1].orders - monthlyData[monthlyData.length - 2].orders) / monthlyData[monthlyData.length - 2].orders * 100)
      : 0;
    
    const customerGrowth = monthlyData.length >= 2 
      ? ((monthlyData[monthlyData.length - 1].customers - monthlyData[monthlyData.length - 2].customers) / monthlyData[monthlyData.length - 2].customers * 100)
      : 0;

    return {
      totalRevenue,
      orderCount,
      customerCount,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      customerGrowth: Math.round(customerGrowth * 10) / 10,
      orderTypeCounts,
      monthlyData
    };
  };

  const [analytics, setAnalytics] = useState(calculateAnalytics());
  const [timeFrame, setTimeFrame] = useState("This Month");

  // Recalculate analytics when orders change
  useEffect(() => {
    setAnalytics(calculateAnalytics());
  }, [orders]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB'
        }).format(amount);
    };

    const StatCard = ({ title, value, growth, icon: Icon, isRevenue = false }) => {
        const isPositive = growth > 0;
        const isZero = growth === 0;
        const displayValue = isRevenue ? formatCurrency(value) : value.toLocaleString();

        return (
            <div className="bg-white border border-[#e2b96c] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[#8B4513] bg-opacity-10 rounded-lg">
                        <Icon className="w-6 h-6 text-[#8B4513]" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                        isZero
                            ? 'hidden'
                            : isPositive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                    }`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : isZero ? <Minus className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(growth)}%
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-[#4b2e2e] mb-1">{displayValue}</h3>
                <p className="text-[#5f4637] text-sm">{title}</p>
            </div>
        );
    };

    const OrdersByTypeCard = ({ counts }) => {
        const totalByType = counts.dineIn + counts.delivery + counts.takeAway;
        return (
            <div className="bg-white border border-[#e2b96c] rounded-2xl p-7 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-4 bg-[#8B4513]/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-7 h-7 text-[#8B4513]" />
                    </div>
                </div>
                {/* <h3 className="text-3xl font-extrabold text-[#342211] mb-0.5 tracking-tight">{totalByType.toLocaleString()}</h3> */}
                {/* <p className="text-[#85644b] text-[15px] mb-4 font-medium">Orders by Type</p> */}
                <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[13px] text-[#927556] font-semibold mb-1">Dine-in</span>
                    <span className="text-xl font-bold text-[#5a3620]">{counts.dineIn}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[13px] text-[#927556] font-semibold mb-1">Delivery</span>
                    <span className="text-xl font-bold text-[#5a3620]">{counts.delivery}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[13px] text-[#927556] font-semibold mb-1">Take-away</span>
                    <span className="text-xl font-bold text-[#5a3620]">{counts.takeAway}</span>
                  </div>
                </div>
            </div>
        );
    };

    const ChartBar = ({ data, maxValue, label }) => {
        const height = (data / maxValue) * 100;
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 bg-gray-200 rounded-t-md h-32 flex items-end">
                    <div 
                        className="w-full bg-gradient-to-t from-[#722828] to-[#a05c2c] rounded-t-md transition-all duration-500"
                        style={{ height: `${height}%` }}
                    ></div>
                </div>
                <span className="text-xs text-[#5f4637] font-medium">{label}</span>
            </div>
        );
    };
    const restaurantInfo = JSON.parse(sessionStorage.getItem("user-data"));
    const restaurantName = restaurantInfo.state.restaurant.name;

    return (
        <div className="h-[calc(100vh-65px)] bg-[#f9f5f0] p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">

                    <div className=" bg-[#8B4513] bg-opacity-10 rounded-lg">
                            {/* <Users className="w-8 h-8 text-[#8B4513]" /> */}
                            <img src={restaurantInfo.state.restaurant.imageCover ||restaurantInfo.state.user.profilePicture } alt="Restaurant Logo" className="w-16 h-16 rounded-lg object-cover border-2 border-white/20" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#4b2e2e]">{restaurantName}</h1>
                            <p className="text-[#5f4637] mt-1">Business Insights</p>
                        </div>
                        </div>
                    {/* <select 
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value)}
                        className="bg-white border border-[#e2b96c] rounded-lg px-4 py-2 text-[#4b2e2e] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                    >
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                    </select> */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={analytics.totalRevenue}
                        growth={analytics.revenueGrowth}
                        icon={DollarSign}
                        isRevenue={true}
                    />
                    <StatCard
                        title="Total Orders"
                        value={analytics.orderCount }
                        growth={analytics.orderGrowth}
                        icon={ShoppingBag}
                    />
                    <OrdersByTypeCard counts={analytics.orderTypeCounts} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white border border-[#e2b96c] rounded-xl p-6 shadow-md">
                        <h3 className="text-xl font-semibold text-[#4b2e2e] mb-6">Monthly Revenue</h3>
                        <div className="flex items-end justify-between gap-4 h-40">
                            {analytics.monthlyData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <span className="text-xs text-[#5f4637] mb-1 font-medium">
                                        {formatCurrency(data.revenue)}
                                    </span>
                                    <ChartBar
                                        data={data.revenue}
                                        maxValue={Math.max(...analytics.monthlyData.map(d => d.revenue))}
                                        label={data.month}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Orders Chart */}
                    <div className="bg-white border border-[#e2b96c] rounded-xl p-6 shadow-md">
                        <h3 className="text-xl font-semibold text-[#4b2e2e] mb-6">Monthly Orders</h3>
                        <div className="relative flex items-end justify-between gap-4 h-40">
                            {/* Vertical axis with numbers */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-[#8B4513] font-medium">
                                {(() => {
                                    const maxOrders = Math.max(...analytics.monthlyData.map(d => d.orders));
                                    const step = Math.ceil(maxOrders / 4);
                                    return [
                                        <span key="4">{maxOrders}</span>,
                                        <span key="3">{Math.ceil(maxOrders * 0.75)}</span>,
                                        <span key="2">{Math.ceil(maxOrders * 0.5)}</span>,
                                        <span key="1">{Math.ceil(maxOrders * 0.25)}</span>,
                                        <span key="0">0</span>
                                    ];
                                })()}
                            </div>
                            {/* Vertical line */}
                            <div className="absolute left-12 top-0 bottom-0 border-l border-[#8B4513] opacity-30"></div>
                            <div className="ml-16 flex items-end justify-between gap-4 h-40 flex-1 ">
                                {analytics.monthlyData.map((data, index) => (
                                    <div key={index} className="relative group">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#4b2e2e] text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                            {data.orders} orders
                                        </div>
                                        <ChartBar
                                            data={data.orders}
                                            maxValue={Math.max(...analytics.monthlyData.map(d => d.orders))}
                                            label={data.month}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                {/* <div className="mt-8 bg-white border border-[#e2b96c] rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-semibold text-[#4b2e2e] mb-4">Performance Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-4 bg-[#8B4513] bg-opacity-5 rounded-lg">
                            <p className="text-[#5f4637]">Average Order Value</p>
                            <p className="text-lg font-semibold text-[#4b2e2e]">{formatCurrency(analytics.totalRevenue / analytics.orderCount)}</p>
                        </div>
                        <div className="text-center p-4 bg-[#8B4513] bg-opacity-5 rounded-lg">
                            <p className="text-[#5f4637]">Orders per Customer</p>
                            <p className="text-lg font-semibold text-[#4b2e2e]">{(analytics.orderCount / analytics.customerCount).toFixed(1)}</p>
                        </div>
                        <div className="text-center p-4 bg-[#8B4513] bg-opacity-5 rounded-lg">
                            <p className="text-[#5f4637]">Revenue per Customer</p>
                            <p className="text-lg font-semibold text-[#4b2e2e]">{formatCurrency(analytics.totalRevenue / analytics.customerCount)}</p>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
 
export default Analytics;