import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    priceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      required: true,
      default: "active",
    },
  },
  { timestamps: true },
);

productSchema.index(
  { sellerId: 1, sku: 1 },
  {
    unique: true,
    partialFilterExpression: { sku: { $type: "string" } },
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;