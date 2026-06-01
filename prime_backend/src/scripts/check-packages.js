import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../loaders/mongoose.js';
import Package from '../models/Package.js';

async function main() {
  await connectDB();
  const packages = await Package.find({});
  console.log("=== SEEDED PACKAGES IN DATABASE ===");
  console.log(JSON.stringify(packages, null, 2));
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
