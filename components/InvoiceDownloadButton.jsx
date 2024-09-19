// components/InvoiceDownloadButton.js
import { generateInvoice } from "../src/utils/generateInvoice";

export default function InvoiceDownloadButton() {
  const handleDownload = async () => {
    const invoiceData = {
      date: "16-09-2024",
      time: "03:15 PM",
      partyName: "CHOUDHURY TRANSPORT",
      billNo: "M/4857/2425",
      vehicleNo: "3659",
      items: [
        {
          description: "278618997706-TIMING OIL SEAL",
          qty: 1,
          price: "1,089.00",
          discount: "10.00",
          nettPrice: "980.10",
        },
        {
          description: "ANABOND RED 85G",
          qty: 2,
          price: "190.00",
          discount: "10.00",
          nettPrice: "342.00",
        },
        {
          description: "DHOTI",
          qty: 4,
          price: "10.00",
          discount: "0.00",
          nettPrice: "40.00",
        },
        {
          description: "8X1.25X18",
          qty: 2,
          price: "10.00",
          discount: "0.00",
          nettPrice: "20.00",
        },
      ],
      roundedOff: "0.10",
      total: "1,382.00",
      paymentNumber: "7978636737",
    };

    // Generate PDF
    const pdfBytes = await generateInvoice(invoiceData);

    // Create a blob from the PDF bytes
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice-${invoiceData.billNo}.pdf`;

    // Automatically click the link to trigger the download
    link.click();
  };

  return <button onClick={handleDownload}>Download Invoice</button>;
}
