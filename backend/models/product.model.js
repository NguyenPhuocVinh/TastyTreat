import mongoose from "mongoose";

export const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value > 0;
        },
        message: "Price must be a positive integer",
      },
    },
    productSubtitles: {
      type: [String],
      default: [],
    },
    feature: {
      type: Boolean,
      default: false,
    },
    imagePath: {
      type: String,
      required: [true, "Please provide image path"],
      validate: {
        validator: function (value) {
          return /\.(jpg|jpeg|png|gif)$/.test(value.toLowerCase());
        },
        message: "Invalid image path",
      },
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
  })
);
