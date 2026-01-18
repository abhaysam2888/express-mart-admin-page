import React from "react";

function Notification({ message = "Notification", type = "warning" }) {
  const styles = {
    success: "bg-green-500 text-white",
    warning: "bg-amber-400 text-black",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className={`max-w-md w-full rounded-xl shadow-lg p-6 text-center ${styles[type]}`}
      >
        <h2 className="text-xl font-bold mb-2">⚠️ Notification</h2>
        <p className="text-base">{message}</p>
      </div>
    </div>
  );
}

export default Notification;
