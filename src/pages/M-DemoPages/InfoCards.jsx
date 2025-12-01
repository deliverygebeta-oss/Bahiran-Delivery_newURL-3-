import {
  ChartNoAxesCombined ,
  ShoppingCart,
  Utensils,
  BarChart2,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import Card from "../../components/Cards/Cards";
import TimerToggle from "../../components/open-close-timer";
import { useMemo } from "react";
import useUserStore from "../../Store/UseStore";

const InfoCards = () => {
  const { orders } = useUserStore();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount || 0);
  };

  const analytics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        orderCount: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
        orderTypeCounts: { dineIn: 0, delivery: 0, takeAway: 0 },
      };
    }

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
      const dayOfMonth = orderDate.getDate();
      return dayOfMonth <= 28;
    });

    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + (order.totalFoodPrice || 0),
      0
    );
    const orderCount = orders.length;

    const orderTypeCounts = orders.reduce(
      (acc, order) => {
        const type = String(order.orderType || order.type || "").toLowerCase();
        if (type.includes("dine")) acc.dineIn += 1;
        else if (type.includes("deliver")) acc.delivery += 1;
        else if (type.includes("take")) acc.takeAway += 1;
        return acc;
      },
      { dineIn: 0, delivery: 0, takeAway: 0 }
    );

    const monthlyStats = {};
    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
      const monthKey = orderDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: orderDate.toLocaleDateString("en-US", { month: "short" }),
          revenue: 0,
          orders: 0,
        };
      }

      monthlyStats[monthKey].revenue += order.totalFoodPrice || 0;
      monthlyStats[monthKey].orders += 1;
    });

    const monthlyData = Object.values(monthlyStats)
      .map((month) => ({
        ...month,
      }))
      .sort((a, b) => new Date(a.month + " 2024") - new Date(b.month + " 2024"))
      .slice(-6);

    const revenueGrowth =
      monthlyData.length >= 2
        ? ((monthlyData[monthlyData.length - 1].revenue -
            monthlyData[monthlyData.length - 2].revenue) /
            monthlyData[monthlyData.length - 2].revenue) *
          100
        : 0;

    const orderGrowth =
      monthlyData.length >= 2
        ? ((monthlyData[monthlyData.length - 1].orders -
            monthlyData[monthlyData.length - 2].orders) /
            monthlyData[monthlyData.length - 2].orders) *
          100
        : 0;

    return {
      totalRevenue,
      orderCount,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      orderTypeCounts,
    };
  }, [orders]);
  const openHours =JSON.parse(sessionStorage.getItem("user-data"))?.state?.restaurant?.isOpenNow;
  const CardInfo = [
    {
      label: "Total Revenue",
      num: formatCurrency(analytics.totalRevenue),
      icon: <ChartNoAxesCombined size={18} />,
      progress: `${Math.abs(analytics.revenueGrowth)}% from last month`,
    },
    {
      label: "Orders",
      num: analytics.orderCount?.toLocaleString?.() || analytics.orderCount,
      icon: <ShoppingCart size={18} />,
      progress: `${Math.abs(analytics.orderGrowth)}% from last month`,
    },
    {
      label: "Orders by Type",
      num: `${analytics.orderTypeCounts.dineIn} / ${analytics.orderTypeCounts.delivery} / ${analytics.orderTypeCounts.takeAway}`,
      icon: <BarChart2 size={18} />,
      progress: "dine-in / delivery / take-away",
    },
    {
      label: "Growth",
      num: `${analytics.revenueGrowth}%`,
      icon: <Utensils size={18} />,
      progress: "Revenue vs last month",
    },
    {
      label: "New updates",
      num: "",
      icon: <Timer size={18} />,
      progress: "Coming soon",
    },

  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 md:justify-between font-noto mt-2">
        {CardInfo.map((item, index) => (
          <Card key={index}>
            <div className="flex flex-col items-start  md:h-[120px] md:w-[210px] gap-2">
            <div>{item.icon}</div>
            <h1 className="md:text-lg font-semibold">{item.label}</h1>
            <div className={`md:text-xl`}>{item.num}</div>
            <p className="md:text-md text-placeholderText">{item.progress}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

export default InfoCards;
