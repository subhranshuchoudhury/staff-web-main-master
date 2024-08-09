const mongoose = require("mongoose");

const DiscountMatrix = new mongoose.Schema({
  groupName:{
    type:String,
    required:true
  },
  partyName:{
    type:String,
    required:true
  },
  value:{
    type:Number,
    required:true
  }
});

mongoose.models = {};
export default mongoose.model("DiscountMatrix", DiscountMatrix);
