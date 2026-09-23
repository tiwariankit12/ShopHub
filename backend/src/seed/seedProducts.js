import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Product from "../models/product.model.js";
import products from "./products.js";

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    // Existing products remove karenge
    await Product.deleteMany({});

    // 100 products insert karenge
    const createdProducts = await Product.insertMany(
      products
    );

    console.log(
      `✅ ${createdProducts.length} products inserted successfully.`
    );

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Product seeding failed:");
    console.error(error.message);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedProducts();