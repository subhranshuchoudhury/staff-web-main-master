const mongoose = require("mongoose");

const SimilarItemSchema = new mongoose.Schema(
    {
        itemName: { type: String, required: true },
        similarList: [
            {
                itemName: { type: String },
            }
        ]
    },
    { timestamps: true }
);

mongoose.models = {};
export default mongoose.model("SimilarItem", SimilarItemSchema);
