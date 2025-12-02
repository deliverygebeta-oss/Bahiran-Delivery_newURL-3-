import{useState,useEffect} from "react";
import { Loading } from "./Loading/Loading";

const AResOrders = ({ restaurantId , restaurantName }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(restaurantName);
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `https://api.bahirandelivery.cloud/api/v1/orders/restaurant/${restaurantId}/orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const data = await res.json();
                console.log(data);
                if (res.ok && data.status === "success") {
                    setOrders(data.data || []);
                } else {
                    throw new Error(data.message || "Failed to load orders");
                }
            } catch (err) {
                console.error("Fetch orders error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) {
            fetchOrders();
        }
    }, [restaurantId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatPrice = (price) => {
        return `${price?.toFixed(2) || '0.00'}ETB`;
    };

    if (loading) {
        return (
            <div className="p-6 bg-[#f4f1e9] h-[500px]">
                <Loading/>
            </div>
        );
    }

    if (error) {
            return (
                <div className="p-6 bg-[#f4f1e9] h-[500px]">
                <div className="text-red-600 text-center">{error}</div>
            </div>
        );
    }

    return ( 
        <>
        <div className="p-2 bg-[#f4f1e9] ">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#4b382a]">{restaurantName}</h1>
                    <p className="text-gray-600 flex">Total Orders: {orders.length}</p>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-full bg-white rounded-md overflow-hidden shadow-md">
                        <table className="min-w-full table-fixed">
                            <thead className="bg-[#e0cda9] text-[#4b382a] sticky top-0">
                                <tr>
                                    <th className="p-2 text-center w-8">#</th>
                                    <th className="p-2 text-center w-32">Order Code</th>
                                    <th className="p-2 text-center w-32">Customer</th>
                                    <th className="p-2 text-center w-32">Phone</th>
                                    <th className="p-2 text-center w-64">Items</th>
                                    <th className="p-2 text-start w-24">Total Price</th>
                                    <th className="p-2 text-center w-24">Order Type</th>
                                    <th className="p-2 text-start w-24 relative group cursor-pointer">
                                        Status
                                        <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white border border-[#e0cda9] rounded-lg shadow-lg p-3 top-10 left-1/2 transform -translate-x-1/2 min-w-[180px]">
                                            <div className="space-y-1 text-xs text-left">
                                                <p className="font-semibold text-[#4b382a] border-b border-[#e0cda9] pb-1 mb-2">Order Status Count</p>
                                                <p><span className="font-medium">Pending:</span> {orders.filter(order => order.orderStatus === 'Pending').length}</p>
                                                <p><span className="font-medium">Preparing:</span> {orders.filter(order => order.orderStatus === 'Preparing').length}</p>
                                                <p><span className="font-medium">Cooked:</span> {orders.filter(order => order.orderStatus === 'Cooked').length}</p>
                                                <p><span className="font-medium">Delivered:</span> {orders.filter(order => order.orderStatus === 'Delivered').length}</p>
                                                <p><span className="font-medium">Cancelled:</span> {orders.filter(order => order.orderStatus === 'Cancelled').length}</p>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="p-2 text-center w-24">Date</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="min-w-full table-fixed">
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="p-4 text-center text-gray-600">
                                                No orders found for this restaurant.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, index) => (
                                            <tr key={order.orderId} className={`border-b hover:bg-[#f9f4ea] ${index % 2 === 1 ? 'bg-[#f8f5f0]' : 'bg-white'}`}>
                                                <td className="p-3 w-6">{index + 1}</td>
                                                <td className="p-3 font-medium w-32">#{order.orderCode}</td>
                                                <td className="p-3 w-32 text-center">{order.userName || 'N/A'}</td>
                                                <td className="p-3 w-32">{order.phone || 'N/A'}</td>
                                                <td className="p-3 w-64">
                                                    <div className="max-w-xs">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="text-[13px]">
                                                                {item.foodName} (x{item.quantity}) - {formatPrice(item.price)}
                                                            </div>
                                                        )) || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-medium w-24">{formatPrice(order.totalFoodPrice)}</td>
                                                <td className="p-3 w-24">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                                                        ${order.orderType === 'Delivery' ? 'bg-blue-100 text-blue-700' :
                                                          order.orderType === 'Pickup' ? 'bg-purple-100 text-purple-700' :
                                                          order.orderType === 'Dine In' ? 'bg-green-100 text-green-700' :
                                                          'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {order.orderType || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="p-3 w-24">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                                                        ${order.orderStatus === 'Delivered' ? 'bg-gray-100 text-gray-700' :
                                                          order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                          order.orderStatus === 'Preparing' ? 'bg-blue-100 text-blue-700' :
                                                          order.orderStatus === 'Cooked' ? 'bg-green-100 text-green-700' :
                                                          order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                          'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {order.orderStatus || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="p-3 w-24" title={new Date(order.orderDate).toLocaleString()}>{formatDate(order.orderDate)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
     );
}
 
export default AResOrders;