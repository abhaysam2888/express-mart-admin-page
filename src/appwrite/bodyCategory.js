import { bucketId, bodyCategoryId } from "../conf/conf";
import {
  DATABASE_ID,
  APPWRITE_ENDPOINT,
  PROJECT_ID,
  storage,
} from "./appwrite.config";
import { Query, Client, TablesDB } from "appwrite";
export class Service {
  client = new Client();
  databases;
  constructor() {
    this.client.setEndpoint(APPWRITE_ENDPOINT).setProject(PROJECT_ID);
    this.databases = new TablesDB(this.client);
    this.databaseId = DATABASE_ID;
    this.collectionId = bodyCategoryId;
  }

  async listBodyCategory({ limit = 10, offset = 0, search = "" } = {}) {
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
        tableId: bodyCategoryId,
        queries,
        total: false,
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to list listBodyCategory: ${error.message}`);
    }
  }

  async searchProducts({ searchTerm = "", limit = 100 }) {
    try {
      const queries = [Query.limit(limit)];

      if (searchTerm.length != 0) {
        queries.push(Query.contains("productName", searchTerm));
      }

      const res = await this.databases.listRows({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        queries: queries,
      });
      console.log(res.rows);

      return res.rows;
    } catch (error) {
      return error;
    }
  }

  // --- DELETE ---
  async deleteProduct(productId) {
    try {
      return await this.databases.deleteRow({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        rowId: productId,
      });
    } catch (error) {
      throw new Error(`Delete deleteProduct failed: ${error.message}`);
    }
  }

  async deleteImage(imageId) {
    if (imageId == null) return;
    try {
      return await storage.deleteFile({
        bucketId: bucketId,
        fileId: imageId,
      });
    } catch (error) {
      throw new Error(`Delete deleteImage failed: ${error.message}`);
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

const bodyCategoryService = new Service();
export default bodyCategoryService;
