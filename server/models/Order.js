import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}$/,
    },
    totalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    refundedMinor: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "fulfilled",
        "cancelled",
        "partially_refunded",
        "refunded",
      ],
      required: true,
    },
    placedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
);

orderSchema.index({ sellerId: 1, orderNumber: 1 }, { unique: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;