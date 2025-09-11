// app/api/upload/route.js
import { NextResponse } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

// Multer-like parsing in Next.js → we use FormData directly
export const runtime = "nodejs"; // ensures Node.js runtime

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function extractInvoiceData(imageBuffers) {
  const model = anthropic("claude-3-haiku-20240307");
  const systemPrompt = `
    You are an expert invoice data extraction service.
    The following images represent sequential pages of a SINGLE INVOICE. Your task is to process all pages and merge the information into one final JSON object.

    Follow these rules carefully:
    1.  **Invoice-Level Details (Number, Date, Format):** These values are usually the same on every page. Extract them from the first page you see them on.
    2.  **Line Items (the 'items' array):** This is the most important rule. You MUST combine the line items from ALL provided pages into a single, continuous list in the final JSON's "items" array. Do not let the items from a later page replace the items from an earlier one. APPEND them to create one complete list.
    3.  **Grand Total:** The "grand_total" is typically found ONLY on the LAST page of the invoice. Prioritize finding this value on the final image provided.

    Extract the following fields:

    For each line item (across all pages, combined into one list):
    - part_no: Part Number (labeled as "Part No.", "SKU", "Item Code", etc.)
    - mrp: Maximum Retail Price (labeled as "MRP", "Price", or "Unit Price")
    - qty: Quantity (labeled as "Qty", "Quantity", etc.)
    - cgst: CGST percentage
    - sgst: SGST percentage
    - discount: Discount percentage
    - amount: Total value for the line item

    Invoice-level details:
    - invoice_no: The main Invoice Number.
    - invoice_date: The date of the invoice (format: DD-MM-YYYY).
    - format: The type of invoice (e.g., "Retail", "Tax").
    - grand_total: The final payable amount (usually on the last page).

    Return the data ONLY in a valid JSON format. Your entire response must be the JSON object and nothing else.

    Example of a final, combined JSON object:
    {
      "invoice_no": "INV-00123",
      "invoice_date": "28-08-2025",
      "format": "Retail",
      "grand_total": 15250.75,
      "message": "Successfully extracted data from 2 pages.",
      "items": [
        // Items from Page 1
        { "part_no": "ABC-123", "mrp": 499, "qty": 2, "cgst": 9, "sgst": 9, "discount": 5, "amount": 938.62 },
        { "part_no": "DEF-456", "mrp": 800, "qty": 5, "cgst": 9, "sgst": 9, "discount": 0, "amount": 4000.00 },
        // Items from Page 2
        { "part_no": "GHI-789", "mrp": 1250.50, "qty": 1, "cgst": 12, "sgst": 12, "discount": 0, "amount": 1750.70 }
      ]
    }

    IMPORTANT:
    - If any field is missing, use "N/A" for string values and 0 for numeric values.
    - Do not include any other text, explanations, or markdown formatting like \`\`\`json.
    - If you find missing information, note it in the "message" field.
    - If no data can be found at all, return an empty structure with a message:
      { "invoice_no": "N/A", "invoice_date": "N/A", "format": "N/A", "grand_total": 0, "message": "No data found on any page.", "items": [] }
    `;

  const userContent = [
    {
      type: "text",
      text: `Please extract data from ${imageBuffers.length} page(s).`,
    },
    ...imageBuffers.map((buf) => ({ type: "image", image: buf })),
  ];

  const { text } = await generateText({
    model,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
    temperature: 0.1,
  });

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("invoices");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded." },
        { status: 400 }
      );
    }

    const buffers = await Promise.all(
      files.map(async (file) => Buffer.from(await file.arrayBuffer()))
    );

    const extractedData = await extractInvoiceData(buffers);
    return NextResponse.json(extractedData);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: `Failed to process invoice. ${err.message}` },
      { status: 500 }
    );
  }
}
