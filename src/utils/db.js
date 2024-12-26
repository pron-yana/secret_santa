import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_DB_URI;

export async function connectDB() {
  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}
