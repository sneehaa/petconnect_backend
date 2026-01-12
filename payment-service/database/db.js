import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.DB_URL) {
    console.error("DB_URL is not defined in environment variables!");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
