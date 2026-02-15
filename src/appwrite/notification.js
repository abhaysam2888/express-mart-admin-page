import { DATABASE_ID, APPWRITE_ENDPOINT, PROJECT_ID } from "./appwrite.config";
import { Client, Functions, TablesDB } from "appwrite";
export class Service {
  client = new Client();
  databases;
  constructor() {
    this.client.setEndpoint(APPWRITE_ENDPOINT).setProject(PROJECT_ID);
    this.databases = new TablesDB(this.client);
    this.function = new Functions(this.client);
  }

  async createNotification({ title, body }) {
    try {
      return await this.function.createExecution({
        functionId: "6991d69c00153548672d",
        body: JSON.stringify({
          title: title,
          body: body,
        }),
      });
    } catch (error) {
      console.error("Appwrite service :: createNotification :: error", error);
      throw error;
    }
  }
}

const notificationService = new Service();
export default notificationService;
