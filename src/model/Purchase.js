const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    sheetdata: { type: String, required: true },
    barcodedata: { type: String, required: false },
    items: { type: Number, required: false },
    invoice: { type: String, required: true },
    partyname: { type: String, required: true },
    desc: { type: String, required: true },
  },
  { timestamps: true }
);

mongoose.models = {};
export default mongoose.model("Purchase", purchaseSchema);
