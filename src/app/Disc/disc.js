// difference

export const ExclusiveCalc = (MRP, TOTAL_AMOUNT, GST, QUANTITY) => {
  MRP = parseFloat(MRP);
  TOTAL_AMOUNT = parseFloat(TOTAL_AMOUNT);
  QUANTITY = parseFloat(QUANTITY);

  const PP = (TOTAL_AMOUNT + (TOTAL_AMOUNT * GST) / 100) / QUANTITY;
  const DISC = ((MRP - PP) / MRP) * 100;
  return Math.round(DISC * 100) / 100;
};
export const ExemptCalc = (MRP, TOTAL_AMOUNT, QUANTITY) => {
  MRP = parseFloat(MRP);
  TOTAL_AMOUNT = parseFloat(TOTAL_AMOUNT);
  QUANTITY = parseFloat(QUANTITY);

  const disc = ((MRP - TOTAL_AMOUNT / QUANTITY) / MRP) * 100;
  return Math.round(disc * 100) / 100;
};
export const InclusiveCalc = (MRP, TOTAL_AMOUNT, QUANTITY) => {
  MRP = parseFloat(MRP);
  TOTAL_AMOUNT = parseFloat(TOTAL_AMOUNT);
  QUANTITY = parseFloat(QUANTITY);

  const Sp = TOTAL_AMOUNT / QUANTITY;
  const disc = ((MRP - Sp) / MRP) * 100;
  return Math.round(disc * 100) / 100;
};

export const TotalAmountCalc = (MRP, DISC, QUANTITY) => {
  MRP = parseFloat(MRP);
  DISC = parseFloat(DISC);
  QUANTITY = parseFloat(QUANTITY);

  const result = (MRP - MRP * (DISC / 100)) * QUANTITY;
  return Math.round(result * 100) / 100;
};

export const reverseCalculateTotal = (finalTotal, gstRate) => {
  finalTotal = parseFloat(finalTotal);
  gstRate = parseFloat(gstRate);

  const originalTotal = finalTotal / (1 + gstRate / 100);
  return Math.round(originalTotal * 100) / 100;
};

// Type II : Discount mentioned

export const exclusiveDM = (MRP, Quantity, discPercent, gst) => {
  MRP = parseFloat(MRP);
  Quantity = parseFloat(Quantity);
  discPercent = parseFloat(discPercent);
  gst = parseFloat(gst);

  const newMRP = MRP * Quantity;
  const amtAfterDisc = newMRP - (newMRP * discPercent) / 100;
  const amtAfterGst = amtAfterDisc + amtAfterDisc * (gst / 100);
  const newDisc = ((newMRP - amtAfterGst) / newMRP) * 100;

  return newDisc;
};

export const IGSTnewDiscPercentage = (REGULAR_DISC, GST) => {

  const newDisc = (REGULAR_DISC + GST) / (1 + (GST / 100));
  return Math.round(newDisc * 100) / 100;

};

export const IGSTnewAmount = (PRICE, NEW_IGST_DISC, QUANTITY, GST) => {
  const newAmount = ((PRICE - PRICE * (NEW_IGST_DISC / 100)) * QUANTITY) * (1 + (GST / 100));
  return (Math.round(newAmount * 100) / 100);
};

// export const unitPriceCalcEX = (TOTAL_AMOUNT, QUANTITY) => {

//   const unitprice = Number(TOTAL_AMOUNT) / Number(QUANTITY);
//   return Math.round(unitprice * 100) / 100;
// };

// export const unitPriceCalcIN = (TOTAL_AMOUNT, QUANTITY, GST) => {
//   const unitprice = (Number(TOTAL_AMOUNT) / Number(QUANTITY)) / (1 + (GST / 100));
//   return Math.round(unitprice * 100) / 100;
// };

// export const totalAmountFromUnitEx = (UNIT_PRICE, QUANTITY) => {
//   const totalAmount = Number(UNIT_PRICE) * Number(QUANTITY);
//   return Math.round(totalAmount * 100) / 100;
// };

// export const totalAmountFromUnitIn = (UNIT_PRICE, QUANTITY, GST) => {
//   const totalAmount = (Number(UNIT_PRICE) * (1 + (GST / 100))) * Number(QUANTITY);
//   return Math.round(totalAmount * 100) / 100;
// };

// Disc% Auto-populate

export const unitPriceCalcEXemptInclDISC = (MRP, DISC) => {
  const unitprice = Number(MRP) - (Number(MRP) * (Number(DISC) / 100));
  return Math.round(unitprice * 100) / 100;
}

export const unitPriceCalcExclDISC = (MRP, DISC, GST) => {
  const unitprice = (Number(MRP) - (Number(MRP) * (Number(DISC) / 100))) / (1 + (Number(GST) / 100));
  return Math.round(unitprice * 100) / 100;
}

// Dynamic purchase module: Input Excel File

// Inclusive & Exempt:

export const getMRPInclusiveExempt = (TOTAL_AMOUNT, QUANTITY, DISC) => {
  const unitAmount = TOTAL_AMOUNT / QUANTITY;
  const mrp = unitAmount / (1 - (DISC / 100))
  return Math.round(mrp)
}

export const getMRPExclusive = (TOTAL_AMOUNT, QUANTITY, DISC, GST) => {
  const unitAmount = TOTAL_AMOUNT / QUANTITY;
  const newUnitAmount = unitAmount * (1 + (GST / 100))
  const mrp = newUnitAmount / (1 - (DISC / 100))
  return Math.round(mrp)
}



