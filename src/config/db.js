import { MongoClient } from "mongodb";
import { mongoDB_uri } from "../../secrets.js";

export const client = new MongoClient(mongoDB_uri, {});

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Pinged! MongoDB connected successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
