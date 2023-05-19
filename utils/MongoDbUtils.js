import { MongoClient } from "mongodb";

export const connectClient = async () => {
  //TODO replace events with even-planner
  return MongoClient.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER_NAME}.rxv84.mongodb.net/${process.env.MONGO_DB_COLLECTION_NAME}?retryWrites=true&w=majority`);
}