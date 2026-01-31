import { headerCategoryId } from "../conf/conf";
import { DATABASE_ID, APPWRITE_ENDPOINT, PROJECT_ID } from "./appwrite.config";
import { Query, Client, TablesDB } from "appwrite";
export class Service {
  client = new Client();
  databases;
  constructor() {
    this.client.setEndpoint(APPWRITE_ENDPOINT).setProject(PROJECT_ID);
    this.databases = new TablesDB(this.client);
    this.databaseId = DATABASE_ID;
    this.collectionId = headerCategoryId;
  }

  async listHeaderCategory({ limit = 10, offset = 0, search = "" } = {}) {
    try {
      const queries = [
        Query.orderAsc("$id"),
        Query.limit(limit),
        Query.offset(offset),
        Query.select(["*", "productCategory.*"]),
      ];

      //   if (search.length !== 0) {
      //     queries.push(Query.contains("productName", search));
      //   }

      const result = await this.databases.listRows({
        databaseId: this.databaseId,
        tableId: headerCategoryId,
        queries,
        total: false,
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to list listHeaderCategory: ${error.message}`);
    }
  }

  // --- UPDATE ---
  async updateBodyCategory(categoryID, data) {
    try {
      return await this.databases.updateRow({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        rowId: categoryID,
        data: data,
      });
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }
}

const headerCategoryService = new Service();
export default headerCategoryService;
