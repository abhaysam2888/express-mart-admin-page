import { format } from "date-fns";
import React, { useState } from "react";

const statusColors = {
  delivered: "bg-green-500 text-black",
  pending: "bg-yellow-400 text-black",
  cancelled: "bg-red-500 text-white",
};

const OrderCard = ({ order }) => {
  const [copied, setCopied] = useState(false);
  console.log(order);

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.$id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Failed to copy Order ID");
    }
  };
  const orderTimeFormatted = order.orderDate
    ? format(new Date(order.orderDate), "MMM dd, h:mm a")
    : "N/A";

  const items = Array.isArray(order?.items) ? order.items : [];

  const subTotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  );

  const finalTotal = (order.totalAmount || 0) + (order.deliveryCharge || 0);

  return (
    <div className="bg-slate-900 rounded-lg p-4 shadow-md border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-blue-400 font-semibold text-sm break-all">
            Order #{order.$id}
          </h3>

          <button
            onClick={copyOrderId}
            className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 transition"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <span
          className={`px-2 py-1 rounded text-xs font-bold w-fit ${
            statusColors[order.status] || "bg-gray-500"
          }`}
        >
          {order.status?.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-slate-300 space-y-1 mb-4">
        <p>
          <span className="font-semibold">Customer:</span> {order.customerName}{" "}
          ({order.phoneNumber})
        </p>
        <p>
          <span className="font-semibold">Order Time:</span>{" "}
          {orderTimeFormatted}
        </p>
        <p className="break-words">
          <span className="font-semibold">Address:</span>{" "}
          {order.shippingAddress?.details ||
            order.shippingAddress?.street ||
            "N/A"}
        </p>
        <p className="break-words">
          <span className="font-semibold">Delivery Agent:</span>{" "}
          {order.deliveryAgents.length > 0
            ? order?.deliveryAgents?.[0].name
            : "N/A"}
        </p>
      </div>

      {/* Items */}
      <div className="border-t border-slate-700 pt-3">
        <h4 className="text-slate-400 text-sm mb-2">Items</h4>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between gap-2 text-sm">
              <span className="flex-1 break-words">
                {item.quantity} × {item.name}
              </span>
              <span className="font-semibold text-right whitespace-nowrap">
                ₹{(item.price * item.quantity).toFixed(2)}
                <span className="text-xs text-slate-400">
                  {" "}
                  / ₹
                  {(
                    item.quantityOptions?.purchasePrice * item.quantity
                  ).toFixed(2)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Finance */}
      <div className="border-t border-slate-700 mt-4 pt-3 text-sm space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-green-400">
          <span>Delivery Fee</span>
          <span>+ ₹{(order.deliveryCharge || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-red-400">
          <span>Discount</span>
          <span>- ₹{(order.discountAmount || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-bold text-base border-t border-slate-600 pt-2">
          <span>Grand Total</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
