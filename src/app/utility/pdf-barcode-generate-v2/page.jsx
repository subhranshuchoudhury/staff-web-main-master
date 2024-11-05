"use client";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import JsBarcode from "jsbarcode";

export default function Component() {
  const [excelJsonInput, setExcelJsonInput] = useState(null);

  const handleExcelFileInput = (e) => {
    const loading = toast.loading(
      "Please wait while we are processing your file..."
    );
    try {
      const selectedFile = e.target.files?.[0];

      if (!selectedFile) {
        toast.dismiss(loading);
        toast.error("Please select an excel file");
        setExcelJsonInput(null);
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const excelData = XLSX.utils.sheet_to_json(sheet, {
          blankrows: false,
          skipHidden: true,
          raw: false,
          rawNumbers: false,
          defval: null,
        });

        setExcelJsonInput(excelData);
        console.log(excelData);
        toast.dismiss(loading);
        toast.success("File processed successfully");
      };
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Excel sheet parsing failed");
      console.log(error);
      setExcelJsonInput(null);
    }
  };

  const generateBarcode = (code) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, code, {
      format: "CODE128",
      width: 2,
      height: 40,
      fontSize: 12,
    });
    return canvas.toDataURL("image/png");
  };

  const createPdf = async () => {
    const toastLoading = toast.loading("Generating PDF...");

    if (!excelJsonInput) {
      toast.dismiss(toastLoading);
      toast.error("No data available to generate PDF");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Convert mm to points (1 mm = 2.83465 points)
    const pageWidth = 30 * 2.83465;
    const pageHeight = 18 * 2.83465;

    for (let item of excelJsonInput) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Generate and embed the barcode image
      const barcodeImageUrl = generateBarcode(item["Item Name"]);
      const barcodeImageBytes = await fetch(barcodeImageUrl).then((res) =>
        res.arrayBuffer()
      );
      const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes);

      // Calculate positions to center the content
      const barcodeWidth = pageWidth * 0.9;
      const barcodeHeight = pageHeight * 0.6;
      const barcodeX = (pageWidth - barcodeWidth) / 2 + 4;
      const barcodeY = pageHeight - barcodeHeight - 2 - 4;

      // Draw the barcode image
      page.drawImage(barcodeImage, {
        x: barcodeX,
        y: barcodeY,
        width: barcodeWidth,
        height: barcodeHeight,
      });

      // Draw Disc Code text
      const discCodeText = `${item["Disc Code"]}`;
      const discCodeTextWidth = font.widthOfTextAtSize(discCodeText, 6);
      page.drawText(discCodeText, {
        x: (pageWidth - discCodeTextWidth) / 2,
        y: barcodeY - 5,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      });

      // Draw Location text
      const locText = `${item["Location"]}`;
      const locTextWidth = font.widthOfTextAtSize(locText, 6);
      page.drawText(locText, {
        x: (pageWidth - locTextWidth) / 2,
        y: barcodeY - 12,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      });
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
    <div>
      <div className="flex flex-col items-center justify-center h-full">
        <Toaster />
        <h1 className="text-2xl font-bold text-center mb-8">
          Generate Barcode Labels PDF (V2)
        </h1>
        <div className="bg-indigo-800 p-8 rounded-lg shadow-md">
          <input
            id="excelData"
            onChange={handleExcelFileInput}
            accept=".xlsx, .xls"
            type="file"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {excelJsonInput && (
            <button
              onClick={createPdf}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Generate PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
