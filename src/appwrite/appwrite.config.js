import { Account, Client, TablesDB, Storage } from "appwrite";
import {
  crousalId,
  databaseId,
  endpoint,
  orderId,
  productCategoryId,
  productId,
  projectId,
} from "../conf/conf";

// *** REPLACE THESE WITH YOUR ACTUAL APPWRITE CREDENTIALS ***
const APPWRITE_ENDPOINT = endpoint;
const PROJECT_ID = projectId;
const DATABASE_ID = databaseId;
const PRODUCT_CATEGORY_COLLECTION_ID = productCategoryId;
const PRODUCT_COLLECTION_ID = productId;
const ORDER_COLLECTION_ID = orderId;
const CROUSAL_COLLECTION_ID = crousalId;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new TablesDB(client);
const account = new Account(client);
const storage = new Storage(client);

// Export the IDs and databases instance for use in the service class
export {
  APPWRITE_ENDPOINT,
  PROJECT_ID,
  account,
  databases,
  client,
  DATABASE_ID,
  PRODUCT_CATEGORY_COLLECTION_ID,
  PRODUCT_COLLECTION_ID,
  ORDER_COLLECTION_ID,
  CROUSAL_COLLECTION_ID,
  storage,
};
