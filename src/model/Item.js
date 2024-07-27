const mongoose = require("mongoose");

const bdsDb = new mongoose.Schema({
  code: {
    type: Number,
    unique: true,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  partNumber: String,
  printName: String,
  groupName: String,
  unitName: String,
  gstPercentage: String,
  storageLocation: String,
  closingStock: Number,
  unitPrice: Number,
  unitPriceAfterDiscount: Number,
  discPercentage: Number,
});

mongoose.models = {};
export default mongoose.model("bdsDb", bdsDb);
