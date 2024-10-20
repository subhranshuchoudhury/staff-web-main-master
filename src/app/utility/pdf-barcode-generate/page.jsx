"use client";
import { PageSizes, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import JsBarcode from "jsbarcode"; // Import JsBarcode for generating barcodes

export default function Page() {
  const [ExcelJsonInput, setExcelJsonInput] = useState(null);

  const handleExcelFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    const loading = toast.loading(
      "Please wait while we are processing your file..."
    );

    if (!selectedFile) {
      toast.dismiss(loading);
      toast.error("Please select an excel file");
      setExcelJsonInput(null);
      return;
    }
    let excelData = null;
    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedFile);
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      excelData = XLSX.utils.sheet_to_json(sheet, {
        blankrows: false,
        skipHidden: true,
        raw: false,
        rawNumbers: false,
        defval: null,
      });

      const groupedItems = groupItems(excelData);

      setExcelJsonInput(groupedItems);
      console.log(groupedItems);
      toast.success("File processed successfully");
      toast.dismiss(loading);
    };
  };

  const groupItems = (items, itemsPerRow = 4) => {
    return items.reduce((acc, item, index) => {
      const rowIndex = Math.floor(index / itemsPerRow);
      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }
      acc[rowIndex].push(item);
      return acc;
    }, []);
  };

  // Generate barcode image for each item using JsBarcode
  const generateBarcode = (code) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, code, { format: "CODE128" });
    return canvas.toDataURL("image/png");
  };

  const createPdf = async () => {
    const toastLoading = toast.loading("Generating PDF...");

    if (!ExcelJsonInput) {
      toast.error("No data available to generate PDF");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4); // Create the first page
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = 810; // Starting position on the page (Increase to move up)
    const rowHeight = 82; // Height for each row to accommodate text and barcode
    const maxItemsPerPage = 40; // Max number of items per page (8 rows x 4 items per row)
    let itemsOnCurrentPage = 0;

    for (let row of ExcelJsonInput) {
      let xPosition = 20; // Starting X position for each row

      for (let item of row) {
        // Generate and embed the barcode image
        const barcodeImageUrl = generateBarcode(item?.["Item Name"]);
        const barcodeImageBytes = await fetch(barcodeImageUrl).then((res) =>
          res.arrayBuffer()
        );
        const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes);

        // Draw the barcode image
        page.drawImage(barcodeImage, {
          x: xPosition,
          y: yPosition - 30, // Place barcode at this position
          width: 100,
          height: 40,
        });

        // Align Disc Code and Loc under the barcode, vertically
        const discCodeText = `${item?.["Disc Code"]}`;
        const locText = `${item?.Location}`;

        // Draw Disc Code text

        // Draw Location text
        page.drawText(discCodeText, {
          x: xPosition + 22,
          y: yPosition - 37, // Align vertically below Disc Code
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });

        page.drawText(locText, {
          x: xPosition + 22,
          y: yPosition - 47, // Align vertically below the barcode
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });

        xPosition += 150; // Move to the next column for the next item
      }

      yPosition -= rowHeight; // Move to the next row
      itemsOnCurrentPage += row.length; // Update the number of items on the current page

      // Check if we need to create a new page after 32 items
      if (itemsOnCurrentPage >= maxItemsPerPage) {
        page = pdfDoc.addPage(PageSizes.A4); // Add a new page
        yPosition = 810; // Reset the starting yPosition for the new page
        itemsOnCurrentPage = 0; // Reset the item count for the new page
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Create a blob and a download link
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BarcodeLabels_${new Date().toLocaleString()}.pdf`;
    link.click();

    toast.dismiss(toastLoading);
    toast.success("PDF generated successfully");
  };

  return (
    <div className="flex justify-center items-center">
      <Toaster />
      {/* Title */}
      <h1 className="text-2xl font-bold text-center m-5">
        PDF Barcode Generate
      </h1>

      {/* Excel file input */}
      <input
        name="own"
        id="excelData"
        onChange={handleExcelFileInput}
        accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        type="file"
        title="Your Excel File"
        className="file-input file-input-bordered file-input-warning w-full max-w-xs"
      />

      {/* PDF Generation button */}
      <div>
        {ExcelJsonInput && (
          <button
            onClick={createPdf}
            className="btn btn-info text-white w-44 h-14 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
          >
            Generate PDF
          </button>
        )}
      </div>
    </div>
  );
}
