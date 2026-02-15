import React, { useState } from "react";
import { projectId } from "../conf/conf";
import notificationService from "../appwrite/notification";

function NotificationSender() {
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "Sending...", type: "info" });

    try {
      const response = await notificationService.createNotification({
        body: formData.body,
        title: formData.title,
      });
      // Replace with your actual Appwrite Function URL or Execution API

      if (response.responseStatusCode == 200) {
        setStatus({
          loading: false,
          message: "Notification Sent!",
          type: "success",
        });
        setFormData({ title: "", body: "" });
      } else {
        throw new Error(result.message || "Failed to send");
      }
    } catch (err) {
      setStatus({ loading: false, message: err.message, type: "error" });
    }
  };

  const styles = {
    success: "bg-green-500 text-white",
    warning: "bg-amber-400 text-black",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    idle: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Send Push Notification
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Hot Deal! 🍕"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Body
            </label>
            <textarea
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your notification message..."
              rows="3"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {status.loading ? "Processing..." : "Dispatch Notification"}
          </button>
        </form>
      </div>

      {/* Status Feedback (Your Original Component Style) */}
      {status.message && (
        <div
          className={`max-w-md w-full rounded-xl shadow-lg p-6 text-center transition-all ${styles[status.type]}`}
        >
          <h2 className="text-xl font-bold mb-2">
            {status.type === "success" ? "✅" : "⚠️"} Status
          </h2>
          <p className="text-base">{status.message}</p>
        </div>
      )}
    </div>
  );
}

export default NotificationSender;
