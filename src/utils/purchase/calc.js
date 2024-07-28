// D4 - mrp & D6 - unit price after discount values

const inclusiveExemptTaxTotalAmount = (unitPriceAfterDiscount, quantity) => {
  if (!unitPriceAfterDiscount || !quantity) {
    return;
  }
  const qty = parseInt(quantity);
  const m = parseFloat(unitPriceAfterDiscount);
  const result = m * qty;
  return Math.round(result * 100) / 100;
};

const exclusiveTaxTotalAmount = (unitPriceAfterDiscount, quantity, gst) => {
  if (!unitPriceAfterDiscount || !quantity || !gst) {
    return;
  }
  const qty = parseInt(quantity);
  const gPercent = parseInt(gst.replace(/%/g, ""));
  const result = (unitPriceAfterDiscount / (1 + gPercent / 100)) * qty;
  return Math.round(result * 100) / 100;
};

export { inclusiveExemptTaxTotalAmount, exclusiveTaxTotalAmount };
