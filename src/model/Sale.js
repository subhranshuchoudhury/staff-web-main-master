const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    sheetdata: { type: String, required: true },
    items: { type: Number, required: false }, // no. of items in the list.
    vehicle: { type: String, required: true },
    desc: { type: String, required: true }, // description
    totalAmount: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose.models = {};
export default mongoose.model("Sale", saleSchema);
