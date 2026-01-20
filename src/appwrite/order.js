import {
  databases,
  DATABASE_ID,
  ORDER_COLLECTION_ID,
  client,
} from "./appwrite.config";
import { Query } from "appwrite";

/**
 * Service class for handling all Appwrite database operations related to Orders.
 */
class OrdersService {
  constructor() {
    this.databases = databases;
    this.databaseId = DATABASE_ID;
    this.collectionId = ORDER_COLLECTION_ID;
  }

  /**
   * Fetches a list of orders from the Appwrite database with optional date and status filters.
   * @param {string | null} [startDateIso=null] - Optional start date in ISO 8601 string format.
   * @param {string | null} [endDateIso=null] - Optional end date in ISO 8601 string format.
   * @param {string} [status='all'] - Order status to filter by (e.g., 'delivered', 'cancelled'). Use 'all' for no status filter.
   * @returns {Promise<Object>} - A promise that resolves with the list of orders.
   */
  async getOrders(startDateIso = null, endDateIso = null, status = "all") {
    try {
      const queries = [];

      // 1. Date Filters (same as before)
      if (startDateIso) {
        queries.push(Query.greaterThanEqual("$createdAt", startDateIso));
      }
      if (endDateIso) {
        queries.push(Query.lessThanEqual("$createdAt", endDateIso));
      }

      // 2. Status Filter (NEW LOGIC)
      if (status !== "all" && status) {
        // Assuming the attribute name in your Appwrite collection is 'orderStatus'
        queries.push(Query.equal("status", [status]));
      }

      // 3. Sorting and Limit
      queries.push(Query.orderDesc("$createdAt"));
      queries.push(Query.select(["*", "deliveryAgents.*"]));
      queries.push(Query.limit(10000000));

      const response = await this.databases.listRows({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        queries: queries,
      });
      const parsedDocuments = response.rows.map((order) => {
        let parsedItems = [];
        let parsedAddress = [];
        // Check if 'items' exists and is a string that needs parsing
        if (order.items && typeof order.items === "string") {
          try {
            parsedItems = JSON.parse(order.items);
            parsedAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            console.error(
              `Error parsing JSON for order ID ${order.$id} items:`,
              e,
            );
            // Fallback to empty array if parsing fails
            parsedItems = [];
            parsedAddress = [];
          }
        } else if (Array.isArray(order.items)) {
          // If Appwrite somehow returns it as an array already (e.g., if null or empty)
          parsedItems = order.items;
          parsedAddress = order.shippingAddress;
        }

        // Return the order object with the 'items' field overwritten by the parsed array
        return {
          ...order,
          items: parsedItems,
          shippingAddress: parsedAddress,
        };
      });

      return {
        success: true,
        data: parsedDocuments, // Return the processed data
        total: response.total,
      };
    } catch (error) {
      console.error("Appwrite Error fetching orders: ", error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error.message,
      };
    }
  }
}

export const ordersService = new OrdersService();
