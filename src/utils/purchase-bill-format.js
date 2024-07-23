const purchaseBillFormat = [
    { label: "BILL SERIES", value: "billSeries" },
    { label: "BILL DATE", value: "billDate" },
    { label: "Purc Type", value: "purchaseType" },
    { label: "PARTY NAME", value: "partyName" },
    { label: "ITC ELIGIBILITY", value: "eligibility" },
    { label: "NARRATION", value: "invoiceNo" },
    { label: "ITEM NAME", value: "itemName" },
    { label: "QTY", value: "quantity", format: "0" },
    { label: "Unit", value: "unit" },
    { label: "PRICE", value: "mrp", format: "0.00" },
    { label: "DISC%", value: "disc", format: "0.00" },
    { label: "Amount", value: "amount", format: "0.00" },
    { label: "CGST", value: "cgst", format: "0" },
    { label: "SGST", value: "sgst", format: "0" },

    { label: "BILL_REF", value: "invoiceNo" },
    {
        label: "BILL_REF_AMOUNT", // * total amount
        value: "BILL_REF_AMOUNT",
        format: "0",
    },
    {
        label: "BILL_REF_DUE_DATE", // * credit days with current days
        value: "bill_ref_due_date",
    },
]

export default purchaseBillFormat;