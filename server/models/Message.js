import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["customer", "seller", "ai"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: function () {
        return this.senderType === "seller" ? "Seller" : "Customer";
      },
      required: function () {
        return this.senderType !== "ai";
      },
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
  },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;