import { generateInvoice } from "./generateInvoice";

const saleInvoiceInvokePDF = async (contents) => {
  let totalAmount = 0;
  let items = [];

  contents.forEach((element) => {
    totalAmount += element?.amount;
    const tempObject = {
      description: element?.itemName,
      price: element?.price,
      qty: element?.qty,
      discount: element?.disc,
      nettPrice: element?.amount,
    };

    items.push(tempObject);
  });

  const invoiceData = {
    date: contents[0]?.billDate,
    time: new Date().toLocaleTimeString(),
    partyName: contents[0]?.partyName,
    billNo: contents[0]?.REMOTE_BILL_REF_NO,
    vehicleNo: contents[0]?.narration,
    items,
    roundedOff: "0.10",
    total: totalAmount,
    paymentNumber: "7978636737",
  };

  // Generate PDF
  const pdfBytes = await generateInvoice(invoiceData);

  // Create a blob from the PDF bytes
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `INVOICE_${
    invoiceData.billNo
  }_${new Date().toLocaleString()}.pdf`;

  // Automatically click the link to trigger the download
  link.click();
};

export default saleInvoiceInvokePDF;
