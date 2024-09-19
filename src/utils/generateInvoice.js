// utils/generateInvoice.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoice(invoiceData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 700]);
  const { width, height } = page.getSize();
  const leftMargin = 10; // Reduced left margin
  const topMargin = 10; // Reduced top margin

  // Draw the header with shop name and contact details
  page.drawText("CASH MEMO", {
    x: leftMargin,
    y: height - topMargin - 15,
    size: 8,
    color: rgb(0, 0, 0),
  });
  page.drawText("JYESHTHA MOTORS", {
    x: leftMargin,
    y: height - topMargin - 35,
    size: 10,
    color: rgb(0, 0, 0),
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });
  page.drawText("NEAR EICHER SHOWROOM, NH5 NIRGUNDI, CUTTACK", {
    x: leftMargin,
    y: height - topMargin - 50,
    size: 8,
  });
  page.drawText("Tel.:7381039614,9583967497", {
    x: leftMargin,
    y: height - topMargin - 65,
    size: 8,
  });

  // Add invoice date and time
  page.drawText(`Date: ${invoiceData.date}  Time: ${invoiceData.time}`, {
    x: leftMargin,
    y: height - topMargin - 85,
    size: 8,
  });

  // Party name and vehicle details
  page.drawText(`Party Name: ${invoiceData.partyName}`, {
    x: leftMargin,
    y: height - topMargin - 100,
    size: 8,
  });
  page.drawText(
    `Bill No: ${invoiceData.billNo}    VEH NO: ${invoiceData.vehicleNo}`,
    { x: leftMargin, y: height - topMargin - 115, size: 8 }
  );

  page.drawText("----------------------------------------------------------", {
    x: leftMargin,
    y: height - topMargin - 125,
    size: 9,
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });

  // Draw table headers for items
  page.drawText("S.N. Description", {
    x: leftMargin,
    y: height - topMargin - 135,
    size: 9,
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });
  page.drawText("Qty", {
    x: leftMargin + 10,
    y: height - topMargin - 150,
    size: 8,
  });
  page.drawText("Price", {
    x: leftMargin + 50,
    y: height - topMargin - 150,
    size: 8,
  });
  page.drawText("Disc %", {
    x: leftMargin + 90,
    y: height - topMargin - 150,
    size: 8,
  });
  page.drawText("Nett. Price", {
    x: leftMargin + 130,
    y: height - topMargin - 150,
    size: 8,
  });

  // Loop through invoice items and add them with the new layout
  let yPosition = height - topMargin - 170;
  invoiceData.items.forEach((item, index) => {
    // Draw the item description on the first line
    page.drawText(`${index + 1}. ${item.description}`, {
      x: leftMargin,
      y: yPosition,
      size: 8,
    });

    // Draw the item details (Qty, Price, Disc %, Nett. Price) on the second line
    yPosition -= 12; // Move down for the details line
    page.drawText(`${item.qty} Pcs`, {
      x: leftMargin + 10,
      y: yPosition,
      size: 8,
    });
    page.drawText(`${item.price}`, {
      x: leftMargin + 50,
      y: yPosition,
      size: 8,
    });
    page.drawText(`${item.discount}%`, {
      x: leftMargin + 90,
      y: yPosition,
      size: 8,
    });
    page.drawText(`${item.nettPrice}`, {
      x: leftMargin + 130,
      y: yPosition,
      size: 8,
    });

    // Move down for the next item
    yPosition -= 15; // Increase the gap between items
  });

  // Add the total, rounding off, and payment methods
  page.drawText(`Less Rounded Off (@): ${invoiceData.roundedOff}`, {
    x: leftMargin,
    y: yPosition - 15,
    size: 8,
  });
  page.drawText("----------------------------------------------------------", {
    x: leftMargin,
    y: yPosition - 20,
    size: 9,
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });
  page.drawText(`GRAND TOTAL: ${invoiceData.total}`, {
    x: leftMargin,
    y: yPosition - 30,
    size: 10,
    color: rgb(0, 0, 0),
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });
  page.drawText("PHONE PE/GOOGLE PAY/PAYTM", {
    x: leftMargin,
    y: yPosition - 45,
    size: 8,
  });
  page.drawText(`${invoiceData.paymentNumber}`, {
    x: leftMargin,
    y: yPosition - 60,
    size: 8,
  });

  // Serialize and return the PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
