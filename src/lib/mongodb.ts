import mongoose from "mongoose";

export const connectToDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    return connection;
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};
