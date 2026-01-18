import React, { useState, useEffect, useMemo } from "react";
import StatsCard from "./StatsCard";
// import DeliveryAgentPayout from "./DeliveryAgentPayout";
// import RestaurantPayout from "./RestaurantPayout";
import { ordersService } from "../appwrite/order";
// import { restaurantWallet } from "../appwrite/restaurantWallet";
import { startOfDay, endOfDay } from "date-fns";
import OrderCard from "./OrderCard";

const dateFilters = {
  TODAY: "today",
  CUSTOM: "custom",
  ALL: "all",
};

const orderStatuses = [
  { label: "All Statuses", value: "all" },
  { label: "Delivered", value: "delivered" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
  // Add other statuses as needed (e.g., 'processing', 'shipped')
];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(dateFilters.TODAY); // Renamed 'filter' to 'dateFilter' for clarity
  const [statusFilter, setStatusFilter] = useState("all"); // New state for status filter
  const [customRange, setCustomRange] = useState({
    start: "", // Date string YYYY-MM-DD
    end: "",
  });
  const [restaurantsWallet, setRestaurantsWallet] = useState([]);

  // Load orders now accepts the status filter
  const loadOrders = async (startIso = null, endIso = null, status = "all") => {
    setLoading(true);
    setError(null);
    // Pass all three filters to the service
    const result = await ordersService.getOrders(startIso, endIso, status);

    if (result.success) {
      setOrders(result.data);
      // setRestaurantsWallet(resWallet.data);
    } else {
      setError(result.error || "Failed to fetch orders.");
    }
    setLoading(false);
  };

  useEffect(() => {
    let startDateIso = null;
    let endDateIso = null;

    // --- 1. Date Filter Logic: Generate ISO Strings ---
    if (dateFilter === dateFilters.TODAY) {
      startDateIso = startOfDay(new Date()).toISOString();
      endDateIso = endOfDay(new Date()).toISOString();
    } else if (
      dateFilter === dateFilters.CUSTOM &&
      customRange.start &&
      customRange.end
    ) {
      startDateIso = startOfDay(new Date(customRange.start)).toISOString();
      endDateIso = endOfDay(new Date(customRange.end)).toISOString();
    }
    // dateFilter === dateFilters.ALL means startDateIso and endDateIso remain null

    // --- 2. Call Service with all filters ---
    loadOrders(startDateIso, endDateIso, statusFilter);
  }, [dateFilter, customRange, statusFilter]); // Re-run effect when dateFilter or statusFilter changes

  const handleCustomRangeChange = (e) => {
    setCustomRange({ ...customRange, [e.target.name]: e.target.value });
  };

  // Note: The calculateMetrics function and metrics/filterDisplay memos are unchanged
  // as they operate on the filtered `orders` list, which is now fetched by the service.

  const calculateMetrics = ({ orderList, restaurantsWalletList }) => {
    let totalOrders = orderList.length;
    let totalEarnings = 0;
    let totalDeliveryAgentFee = 0;
    let totalRestaurantRevenue = 0;

    if (!Array.isArray(orderList)) {
      return {
        totalOrders: 0,
        totalEarnings: "0.00",
        totalDeliveryAgentFee: "0.00",
        totalRestaurantRevenue: "0.00",
        totalProfit: "0.00",
      };
    }

    orderList.forEach((order) => {
      const orderTotalAmount = order.totalAmount || 0;
      const orderDeliveryCharge = order.deliveryCharge || 0;
      const orderDiscount = order.discountAmount || 0;
      const orderDeliveryAgentFee = order.deliveryAgentFee || 0;
      // console.log(order.items[0].quantityOptions);

      const orderEarnings =
        orderTotalAmount + orderDeliveryCharge - orderDiscount;
      totalEarnings += orderEarnings;
      totalDeliveryAgentFee += orderDeliveryAgentFee;

      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          totalRestaurantRevenue +=
            (item.quantityOptions.purchasePrice || 0) * (item.quantity || 1);
        });
      }
    });

    const totalProfit =
      totalEarnings - totalDeliveryAgentFee - totalRestaurantRevenue;

    return {
      totalOrders,
      totalEarnings: totalEarnings.toFixed(2),
      totalDeliveryAgentFee: totalDeliveryAgentFee.toFixed(2),
      totalRestaurantRevenue: totalRestaurantRevenue.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  const metrics = useMemo(
    () =>
      calculateMetrics({
        orderList: orders,
        restaurantsWalletList: restaurantsWallet,
      }),
    [orders, restaurantsWallet]
  );

  const filterDisplay = useMemo(() => {
    const statusText =
      statusFilter === "all"
        ? "All Statuses"
        : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    let dateText;
    if (dateFilter === dateFilters.TODAY) dateText = "Today";
    else if (dateFilter === dateFilters.ALL) dateText = "All Time";
    else if (
      dateFilter === dateFilters.CUSTOM &&
      customRange.start &&
      customRange.end
    ) {
      dateText = `${customRange.start} to ${customRange.end}`;
    } else dateText = "Custom Range";

    return `Status: ${statusText}, Dates: ${dateText}`;
  }, [dateFilter, customRange, statusFilter]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        Loading orders...
      </div>
    );

  if (error)
    return <div className="text-red-400 text-center mt-10">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>📊 Rasan Dashboard</h1>

      {/* --- Filter Controls --- */}
      <div className="mb-6 bg-slate-900 p-4 rounded-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 p-2 rounded"
            >
              {orderStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setDateFilter(dateFilters.TODAY)}
              className={`px-4 py-2 rounded ${
                dateFilter === dateFilters.TODAY
                  ? "bg-blue-600"
                  : "bg-slate-700"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter(dateFilters.ALL)}
              className={`px-4 py-2 rounded ${
                dateFilter === dateFilters.ALL ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              All Time
            </button>
          </div>

          {/* Custom Date */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              name="start"
              value={customRange.start}
              onChange={handleCustomRangeChange}
              className="bg-slate-800 border border-slate-700 p-2 rounded"
            />
            <input
              type="date"
              name="end"
              value={customRange.end}
              onChange={handleCustomRangeChange}
              className="bg-slate-800 border border-slate-700 p-2 rounded"
            />
            <button
              onClick={() => setDateFilter(dateFilters.CUSTOM)}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* --- Statistics Grid --- */}
      <h2>Key Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={metrics.totalOrders}
          filterText={filterDisplay}
        />
        {/* ... other StatsCards using the same logic ... */}
        <StatsCard
          title="Total Earnings"
          value={`₹${metrics.totalEarnings}`}
          filterText={`Gross: (Order Amt + Delivery Fee) - Discount. ${filterDisplay}`}
        />
        <StatsCard
          title="Total Profit"
          value={`₹${metrics.totalProfit}`}
          filterText={`Earnings - (Agent Fee + store Revenue). ${filterDisplay}`}
        />
        <StatsCard
          title="Paid to Store"
          value={`₹${metrics.totalRestaurantRevenue}`}
          filterText={`Item purchasePrice * quantity. ${filterDisplay}`}
        />
      </div>

      {/* --- Payout Data --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* <DeliveryAgentPayout /> */}
        {/* <RestaurantPayout /> */}
      </div>

      {/* --- Raw Orders Display (Optional) --- */}
      <h2 style={{ marginTop: "30px" }}>Orders List ({orders.length} items)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard key={order.$id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
