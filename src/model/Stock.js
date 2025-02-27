const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    sheetdata: { type: String, required: false },
    RStockPositiveSheet: { type: String, required: false },
    RStockNegativeSheet: { type: String, required: false },
    RackChangeSheet: { type: String, required: false },
    items: { type: Number, required: false }, // no. of items in the list.
    desc: { type: String, required: true }, // description
  },
  { timestamps: true }
);

mongoose.models = {};
export default mongoose.model("Stock", stockSchema);
