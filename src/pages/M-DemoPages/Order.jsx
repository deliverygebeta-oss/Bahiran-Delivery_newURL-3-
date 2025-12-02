import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import useUserStore from "../../Store/UseStore";
import { InlineLoadingDots , Loading } from "../../components/Loading/Loading";
import { addErrorNotification, addSuccessNotification } from "../../utils/notifications";
import orderPollingService from "../../services/OrderPollingService";

const ManagerOrders = () => {
  const [expandedCards, setExpandedCards] = useState([]); // ✅ multiple expanded cards
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryCode, setDeliveryCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Get orders and actions from Zustand store
  const { 
    orders, 
    ordersLoading, 
    ordersError,
    updateOrderStatus,
    newOrderAlert, 
    latestOrderId, 
    setNewOrderAlert 
  } = useUserStore();

  // Trigger order fetch when user enters this page
  const fetchOrders = async () => {
    try {
      const storeData = JSON.parse(sessionStorage.getItem("user-data"));
      const restaurantId = storeData?.state?.restaurant?.id;
      const token = localStorage.getItem("token");
      if (!restaurantId || !token) {
        throw new Error("Missing restaurantId or token");
      }

      const response = await fetch(
        `https://gebeta-delivery1.onrender.com/api/v1/orders/restaurant/${restaurantId}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      console.log(data);

      // Store orders in Zustand if used, otherwise just log
      if (Array.isArray(data?.data)) {
        useUserStore.getState().setOrders?.(data.data);
      }
      // Optionally handle new order logic similar to polling service
    } catch (error) {
      console.error("Error fetching orders: ", error);
      useUserStore.getState().setOrdersError?.("Failed@ to fetch orders");
    }
  };

  useEffect(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      try { orderPollingService.refreshOrders?.(); } catch {}
      fetchOrders();
    }
  }, []);
  // Orders are already sorted by OrderPollingService

  const filteredOrders = (Array.isArray(orders) ? orders : [])
    .filter((order) => {
      const allowedStatuses = ["pending", "cooked", "canceled", "preparing"];
      return allowedStatuses.includes(order.orderStatus?.toLowerCase());
    })
    .filter(
      (order) =>
        order.orderCode?.toLowerCase().includes(searchQuery.toLowerCase()) 
      // ||
        // order.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Orders are now fetched centrally by OrderPollingService and stored in Zustand
  // No need for local fetching logic here

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (id, newStatus) => {
    // Update local state immediately
    updateOrderStatus(id, newStatus);

    try {
      await axios.patch(
        `https://gebeta-delivery1.onrender.com/api/v1/orders/${id}/status`,
        {
          orderId: id,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert the change if API call fails
      updateOrderStatus(id, orders.find(order => order.orderId === id)?.orderStatus || "Pending");
    }
  };

  const getStatusColor = (status) => {
    if (status === "Cooked") return "bg-green-100 text-green-700";
    if (status === "Canceled") return "bg-red-100 text-red-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    return "bg-yellow-100 text-yellow-800";
  };

  const handelVerify = async (orderId , deliveryCode) => {
    console.log(orderId, deliveryCode);
    setLoading(true);
    try{
      const res = await axios.post(`https://gebeta-delivery1.onrender.com/api/v1/orders/verify-restaurant-pickup`,{
        orderId: orderId,
        pickupVerificationCode: deliveryCode,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("+++++=",res);
      console.log(orderId, deliveryCode);
      addSuccessNotification("Order Verified", "Delivery verification completed successfully");
    } catch (err) {
      console.error("Failed to verify order", err);
      addErrorNotification("Verification Failed", "Unable to verify delivery code");
    }finally{
      setLoading(false);
    }
  };
  
  return (
    <>
    <div className="h-[calc(100vh-65px)] bg-[#f9f5f0] p-6 ">
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by order code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 ml-5 px-4 py-2 border border-[#caa954] rounded-md bg-[#fefcf7] focus:outline-none focus:ring-2 focus:ring-[#d4af37] w-64"
        />
      </div>
      <h1 className="text-3xl font-bold text-center text-[#8B4513] mb-6">
        Orders Dashboard
      </h1>

      {ordersLoading && (
        <div className="text-center py-4">
          <Loading />
        </div>
      )}

      {ordersError && (
        <div className="text-center py-4">
          <p className="text-red-600">Error: {ordersError}</p>
        </div>
      )}

      {!ordersLoading && !ordersError && (
        <div className="overflow-y-auto h-[79%]  w-[90%] lg:h-[69%] lg:w-[80%] scrollbar-hide scroll-smooth fixed p-2 ">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3  ">
          {filteredOrders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .map((order) => (
              <div
                key={order.orderId}
                className={`bg-white border border-[#e2b96c] rounded-xl shadow-md hover:shadow-lg cursor-pointer motion-preset-confetti transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                  expandedCards.includes(order.orderId) ? "p-4 pb-6" : "p-4"
                }`}
              >
                <div onClick={() => toggleExpand(order.orderId)}>
                  <div className="flex justify-between items-center ">
                    <div>
                      <h2 className="text-xl font-semibold text-[#4b2e2e]">
                        {order.userName}
                      </h2>
                      <h2 className="text-sm font-medium text-[#8b4513c8]">
                        #{order.orderCode}
                      </h2>
                    </div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <p className="text-[#5f4637] mt-2">
                    <span className="font-medium">Order:</span>{" "}
                    {order.items
                      ?.map(
                        (item) => `${item.foodName}` + `  (x${item.quantity})`
                      )
                      .join(", ") || "N/A"}
                    <br />
                    <span className="font-medium">Total Order:</span> 
                    {order.items
                      ?.reduce((total, item) => total + item.quantity, 0) || "N/A"}
                  </p>
                  <p className="text-[#5f4637]">
                    <span className="font-medium">Order Type:</span> {order.orderType}
                  </p>
                  <p className="text-[#5f4637]">
                    <span className="font-medium">Total:</span>{" "}
                    {order.totalFoodPrice} ETB
                  </p>
                  {order.description && (
                    <p className="text-[#5f4637] border p-1 rounded-lg bg-[#faf8f3]">
                      <span className="font-bold">Description:</span>{" "}
                      {order.description}
                    </p>
                  )}
                  <p className="text-sm text-[#a37c2c] italic">
                    Placed on: {new Date(order.orderDate).toLocaleString()}
                  </p>
                  <div className={`flex justify-self-end`}>
                    <ChevronDown
                      className={`w-4 h-4 transition-all duration-300 ${
                        expandedCards.includes(order.orderId)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </div>

                {expandedCards.includes(order.orderId) && (
                  <div className="mt-4 space-y-2 border-t pt-3 border-dashed border-[#caa954] text-sm text-[#3f2c1b] transform-all duration-900">
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {order.phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Type of Order:</span>{" "}
                      {order.orderType}
                    </p>

                    <div className="mt-2">
                      <label className="block text-sm font-semibold text-[#5a3b1a] mb-1">
                        Update Status:
                      </label>
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order.orderId, e.target.value)
                        }
                        className="w-full p-2 border border-[#caa954] rounded-md bg-[#fefcf7] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* <option value="Pending">Pending</option> */}
                        <option value="Preparing">Preparing</option>
                        <option value="Cooked">Cooked</option>
                        {/* <option value="Delivering">Delivering</option> */}
                        {/* <option value="Completed">Completed</option> */}
                        {/* <option value="Canceled">Canceled</option> */}

                      </select>
                      <div className="flex gap-3 p-2 px-0">
                        <input
                        onChange={(e)=>{setDeliveryCode(e.target.value)}}
                          type="text"
                          placeholder="Enter Delivery Code"
                          className="w-full p-2 border border-[#caa954] rounded-md bg-[#fefcf7] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                        />
                        <button
                        onClick={(e)=>{handelVerify(order.orderId, deliveryCode); console.log(order.orderId)}}
                        className={`py-2 px-2 bg-[#8b4513c8] text-white rounded-md hover:bg-[#a05c2c] transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                          {loading ? <InlineLoadingDots /> : "Verify"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ManagerOrders;