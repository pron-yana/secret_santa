import mongoose from 'mongoose';
const uri =
  'mongodb+srv://nagatolt427:auZwBYVBndtMhEr1@cluster0.r4rmm.mongodb.net/secret_santa?retryWrites=true&w=majority';

export async function connectDB() {
  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}
