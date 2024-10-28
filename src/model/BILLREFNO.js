const mongoose = require("mongoose");

const billRefNoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    prefix: { type: String, default: "APP" }, // Prefix for the label, default is "APP"
    index: { type: Number, required: true, unique: true }, // Unique incrementing sequence number
    suffix: { type: String, default: "2425" }, // Suffix for the label, default is "2425"
    isUsed: { type: Boolean, required: false, default: false }, // Track if the label is used
  },
  { timestamps: true }
);

// Virtual field to generate the label in the format "APP/1/2425"
billRefNoSchema.virtual("label").get(function () {
  return `${this.prefix}/${this.index}/${this.suffix}`;
});

// Ensure `label` field is included in JSON output
billRefNoSchema.set("toJSON", { virtuals: true });
billRefNoSchema.set("toObject", { virtuals: true });

mongoose.models = {};
export default mongoose.model("BillRefNo", billRefNoSchema);
