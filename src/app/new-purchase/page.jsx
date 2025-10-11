"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import { useState, useEffect, useRef } from "react";
import Select, { createFilter } from "react-select";
import gstAmount from "../DB/Purchase/gstamount";
import gstType from "../DB/Purchase/gsttype";
import {
  InclusiveCalc,
  ExclusiveCalc,
  ExemptCalc,
  TotalAmountCalc,
  exclusiveDM,
  IGSTnewAmount,
  IGSTnewDiscPercentage,
  unitPriceCalcExclDISC,
  unitPriceCalcEXemptInclDISC,
  reverseCalculateTotal,
} from "../Disc/disc";
import Image from "next/image";
import CustomOption from "../Dropdown/CustomOption";
import CustomMenuList from "../Dropdown/CustomMenuList";
import purchasetype from "../DB/Purchase/purchasetype";
import toast, { Toaster } from "react-hot-toast";
import { choiceIGST } from "../DB/Purchase/choice";
import dateToFormattedString from "@/utils/dateFormatter";
import purchaseBillFormat from "@/utils/purchase-bill-format";
import purchaseBarcodeFormat from "@/utils/purchase-barcode-format";
import {
  setLocalStorage,
  clearLocalStorage,
  getLocalStorageJSONParse,
} from "@/utils/localstorage";
import { SimpleIDB } from "@/utils/idb";
import {
  exclusiveTaxTotalAmount,
  inclusiveExemptTaxTotalAmount,
} from "@/utils/purchase/calc";
import parseDDMMYYYY from "@/utils/dateParser";
const purchaseIDB = new SimpleIDB("Purchase", "purchase");

export default function page() {
  useEffect(() => {
    checkNotDownload();
    getItemsData();
  }, []);

  const [loadingExcel, setLoadingExcel] = useState(true);
  const [excelContent, setExcelContent] = useState([]);
  const [partyData, setPartyData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [DiscountStructure, setDiscountStructure] = useState([]);
  const [gotDbValue, setGotDbValue] = useState(false);
  const [isClaudeModalOpen, setClaudeModalOpen] = useState(false);
  // const [qrResult, setQrResult] = useState("");
  // const [barcodeScannedData, setBarcodeScannedData] = useState(null);
   const [editedApiResponse, setEditedApiResponse] = useState(null);
   const [editingInvoice, setEditingInvoice] = useState(false);
   const [editingItemIndex, setEditingItemIndex] = useState(null);

   const [addedItems, setAddedItems] = useState(new Set());

   const [formData, setFormData] = useState({
     partyName: null,
     invoiceNo: null,
     invoiceDate: new Date(), // default date is today
     gstType: null,
     unit: "Pcs", // default value
     purchaseType: "DNM",
     mDiscPercentage: 0, // mention discount percentage
     itemName: null,
     itemPartNoOrg: null, // part no of the item
     itemLocation: null, // from item data
     quantity: 0,
     mrp: null, // D4 value
     unitPriceAfterDiscount_D6: null,
     gstPercentage: null,
     amount: null,
     finalDisc: "ERROR!",
     selectedItemRow: -1,
     isIGST: false,
     dynamicdisc: null,
     unitPrice: 0,
     repetitionPrint: 0,
     selectedData: null,
     purchaseTypeText: null,
   });
   const [SelectedItem, setSelectedItem] = useState(null);
   const [disc, setDisc] = useState(0);
   const [modalMessage, setModalMessage] = useState({
     title: "",
     message: "",
     button: "",
   });

   const [modalConfirmation, setModalConfirmation] = useState({
     title: "",
     message: "",
     button_1: "",
     button_2: "",
     messages: [],
     btn_f_1: () => {},
     btn_f_2: () => {},
     norm_f_3: () => {},
     norm_f_4: () => {},
   });

   // * handle the modal

   const handleModal = (title, message, button) => {
     setModalMessage({ title, message, button });
   };

   const handleConfirmationModal = (
     title,
     message,
     button_1,
     button_2,
     messages,
     f1,
     f2,
     f3
   ) => {
     setModalConfirmation({
       title,
       message,
       button_1,
       button_2,
       messages,
       btn_f_1: f1,
       btn_f_2: f2,
       norm_f_3: f3,
     });
   };

   const handleFormChange = (name, value) => {
     if (!name) return;
     setFormData((values) => ({ ...values, [name]: value }));
   };

   const getItemsData = async () => {
     console.log("Fetching item & party data...");

     try {
       setLoadingExcel(true);

       const storedItemData = await purchaseIDB.get("ITEMS_DATA");
       const storedPartyData = await purchaseIDB.get("PARTIES_DATA");
       const storedDiscountStructure = await purchaseIDB.get(
         "DISCOUNT_STRUCTURE"
       );

       if (storedItemData) setItemData(JSON.parse(storedItemData));
       if (storedPartyData) setPartyData(JSON.parse(storedPartyData));
       if (storedDiscountStructure)
         setDiscountStructure(JSON.parse(storedDiscountStructure));

       const responses = await Promise.all([
         fetch("/api/items"),
         fetch(
           "https://script.google.com/macros/s/AKfycbwr8ndVgq8gTbhOCRZChJT8xEOZZCOrjev29Uk6DCDLQksysu80oTb8VSnoZMsCQa3g/exec"
         ),
         fetch("/api/discount-matrix"),
       ]);

       const data = await Promise.all(
         responses.map((response) => response.json())
       );

       const [itemData, partyData, discountStructure] = data;

       if (
         itemData?.length > 0 &&
         partyData?.length > 0 &&
         discountStructure?.length > 0
       ) {
         setItemData(itemData);
         setPartyData(partyData);
         setDiscountStructure(discountStructure);
         setLoadingExcel(false);

         await purchaseIDB.set("ITEMS_DATA", JSON.stringify(itemData));
         await purchaseIDB.set("PARTIES_DATA", JSON.stringify(partyData));
         await purchaseIDB.set(
           "DISCOUNT_STRUCTURE",
           JSON.stringify(discountStructure)
         );
       } else {
         toast.error("Some data could not load from database");
       }
     } catch (error) {
       console.error("Error fetching data:", error);
       toast.error("Failed while getting item & party data.");
     } finally {
       setLoadingExcel(false);
     }
   };

   // Append new added items to the localStorage in case of refresh
   const storeNotDownload = (obj) => {
     const retrievedArray =
       getLocalStorageJSONParse("PURCHASE_NOT_DOWNLOAD_DATA") || [];
     retrievedArray.push(obj);
     setLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA", retrievedArray);
   };

   // Check if there is items are available that are not downloaded

   const checkNotDownload = (isAgreed = false) => {
     const retrievedArray = getLocalStorageJSONParse(
       "PURCHASE_NOT_DOWNLOAD_DATA"
     );
     if (retrievedArray && retrievedArray.length === 0) return;
     const agreed = () => {
       if (retrievedArray !== null && retrievedArray !== undefined) {
         setExcelContent(retrievedArray);
         const constantFields = retrievedArray[0];
         let dateString = constantFields?.billDate || "26-08-2003";
         let dateParts = dateString.split("-");
         let dateObject = new Date(
           dateParts[2],
           dateParts[1] - 1,
           dateParts[0]
         );

         handleFormChange("invoiceNo", constantFields?.invoiceNo);
         handleFormChange("partyName", constantFields?.partyName);
         handleFormChange("invoiceDate", dateObject);
       }
     };

     if (isAgreed) {
       agreed();
       return;
     }

     handleConfirmationModal(
       "Confirmation ❓",
       "Do you want to restore previous purchases?",
       "Yes",
       "No",
       [
         {
           data: `📜 Invoice: ${retrievedArray?.[0]?.invoiceNo}`,
           style: "text-xl font-bold",
         },
         {
           data: `🤵 Party: ${retrievedArray?.[0]?.partyName}`,
           style: "text-sm",
         },
         {
           data: `📑 Total: ${retrievedArray?.length} items`,
           style: "text-sm",
         },
         {
           data: `📅 Date: ${retrievedArray?.[0]?.billDate}`,
           style: "text-sm",
         },
       ],

       agreed,
       () => clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA")
     );
     retrievedArray && window.purchase_modal_2.showModal();
   };

   // Alert user when user tries to add a item that is previously added
   const isDuplicate = (item) => {
     const result = excelContent.find(
       (obj) =>
         obj?.partyName === item?.partyName &&
         obj?.itemName === item?.itemName &&
         obj?.itemName !== null &&
         obj?.itemName !== undefined &&
         obj?.partyName !== null &&
         obj?.partyName !== undefined
     );
     if (result) {
       return true;
     }
     return false;
   };

   // * form validation

   const isFormValidated = (form) => {
     for (let key in form) {
       if (
         key === "dynamicdisc" ||
         key === "itemPartNoOrg" ||
         key === "unitPriceAfterDiscount_D6" ||
         key === "unitPrice" ||
         key === "purchaseTypeText"
       )
         continue;

       if (form[key] === null || form[key] === undefined || form[key] === "") {
         handleModal(
           "❌ Error",
           `Please fill "${key
             .replace(/[A-Z]/g, (match) => " " + match)
             .trim()
             .toUpperCase()}" field.`,
           "Okay"
         );
         window.purchase_modal_1.showModal();

         return false;
       }
     }
     return true;
   };

   // * handle the add button

   const addSingleFormContent = () => {
     // * mutable values
     let gstValue =
       formData?.gstType === "Exempt"
         ? 0
         : parseInt(formData?.gstPercentage?.split("%")[0]?.trim());
     let purchaseType = "";
     let eligibility = "Goods/Services";
     let bill = "GST";
     let cgst = 0;
     let disc = 0;
     // * discount calculation

     if (formData?.gstType === "Exempt") {
       gstValue = 0;
       bill = "Main";
       cgst = 0;
       purchaseType = "EXEMPT";
       disc = ExemptCalc(formData?.mrp, formData?.amount, formData?.quantity);
       setDisc(ExemptCalc(formData?.mrp, formData?.amount, formData?.quantity));
       eligibility = "None";
     } else if (formData?.gstType === "Inclusive") {
       purchaseType = "GST(INCL)";
       disc = InclusiveCalc(
         formData?.mrp,
         formData?.amount,
         formData?.quantity
       );
       setDisc(
         InclusiveCalc(formData?.mrp, formData?.amount, formData?.quantity)
       );
       cgst = parseInt(gstValue / 2);
     } else {
       purchaseType = "GST(INCL)";
       disc = ExclusiveCalc(
         formData?.mrp,
         formData?.amount,
         gstValue,
         formData?.quantity
       );
       setDisc(
         ExclusiveCalc(
           formData?.mrp,
           formData?.amount,
           gstValue,
           formData?.quantity
         )
       );
       cgst = parseInt(gstValue / 2);
     }

     if (formData?.purchaseType === "DM" && formData?.gstType === "Exclusive")
       setDisc(
         exclusiveDM(
           formData?.mrp,
           formData?.quantity,
           formData?.mDiscPercentage,
           gstValue
         )
       );
     if (formData?.purchaseType === "DM") {
       disc = formData?.mDiscPercentage;
       setDisc(formData?.mDiscPercentage);
     }

     let amountField = TotalAmountCalc(formData?.mrp, disc, formData?.quantity);

     const tempContent = {
       billSeries: bill,
       billDate: dateToFormattedString(formData?.invoiceDate),
       originDate: formData?.invoiceDate,
       purchaseType: formData?.purchaseType,
       purchaseTypeText: purchaseType,
       partyName: formData?.partyName,
       eligibility: eligibility,
       invoiceNo: formData?.invoiceNo,
       itemName: formData?.itemName,
       quantity: formData?.quantity,
       unit: formData?.unit,
       mrp: formData?.mrp,
       itemPartNo: formData?.itemPartNoOrg,
       disc: disc,
       amount: amountField,
       cgst: cgst,
       sgst: cgst,
       itemLocation: formData?.itemLocation,
       repetition: parseInt(formData?.repetitionPrint),
       isIGST: formData?.isIGST,
       gstPercentage: formData?.gstPercentage,
       mDiscPercentage: formData?.mDiscPercentage,
       selectedData: formData?.selectedData,
       repetitionPrint: parseInt(formData?.repetitionPrint),
       gstType: formData?.gstType,
       creditDays: formData?.creditDays,
       unitPrice: formData?.unitPrice,
     };
     // dynamic discount calculation
     handleFormChange("dynamicdisc", disc);

     if (excelContent?.length === 0) {
       // credit days function

       const getFutureDate = (curDate, fuDay) => {
         const tempDate = new Date(curDate);
         tempDate.setDate(tempDate.getDate() + fuDay);
         return tempDate;
       };

       const futureCreditDay = dateToFormattedString(
         getFutureDate(formData?.invoiceDate, formData?.creditDays)
       );

       tempContent.bill_ref_due_date = futureCreditDay;
     }

     const repetitionModal = (value) => {
       handleFormChange("repetitionPrint", value);
       if (isNaN(value)) {
         //  when user clears all the value it will go back to default.
         tempContent.repetition = parseInt(formData.quantity);
       } else {
         tempContent.repetition = value;
       }
     };

     const modalConfirmedAdd = () => {
  // This single line replaces the original conditional block from lines 73-77
  setExcelContent((prevArray) => [...prevArray, tempContent]);

  // * saving the data to localStorage
  if (!isEditing) storeNotDownload(tempContent);
  else {
    const datas = localStorage.getItem("PURCHASE_NOT_DOWNLOAD_DATA");
    const parsedData = JSON.parse(datas);
    const index = parsedData.findIndex(
      (obj) =>
        obj.selectedData.code === tempContent.selectedData.code &&
        obj.partyName === tempContent.partyName
    );
    parsedData[index] = tempContent;
    localStorage.setItem(
      "PURCHASE_NOT_DOWNLOAD_DATA",
      JSON.stringify(parsedData)
    );
    setIsEditing(false);
  }

  // * show the modal
  if (isEditing)
    handleModal("Success ✅", "Content Edited Successfully!", "Okay");
  else handleModal("Success ✅", "Content Added Successfully!", "Okay");
  window.purchase_modal_1.showModal();

  // * clearing fields
  handleFormChange("itemName", null);
  handleFormChange("dynamicdisc", null);
  handleFormChange("quantity", null);
  handleFormChange("repetitionPrint", null);
  handleFormChange("mrp", null);
  handleFormChange("itemLocation", null);
  handleFormChange("unitPrice", "");
  handleFormChange("gstPercentage", 0);
  if (formData?.purchaseType === "DNM")
    handleFormChange("purchaseType", "DNM");
  else handleFormChange("purchaseType", "DM");
  handleFormChange("purchaseTypeText", null);
  handleFormChange("selectedData", null);
  setSelectedItem(null);

  if (formData?.gstType !== "Exempt")
    handleFormChange("gstPercentage", null);
  handleFormChange("amount", null);
};


     const askForConfirmation = (choice) => {
       if (choice === "NO") tempContent.repetition = 0;

       handleConfirmationModal(
         "Confirmation",
         !isEditing
           ? "Are you sure you want to add this content?"
           : "Are you sure you want to edit this content?",
         "Yes",
         "No",
         [
           {
             data: `🎫 Discount: ${disc}%`,
             style: "text-xl font-bold text-orange-500",
           },
           {
             data: `🗺 Location: ${formData?.itemLocation}`,
             style: "text-xl font-bold",
           },
           {
             data: `📜 Invoice: ${formData?.invoiceNo}`,
             style: "text-xl font-bold",
           },
           {
             data: `Party: ${formData?.partyName}`,
             style: "text-sm",
           },
           {
             data: `Item: ${formData?.itemName}`,
             style: "text-sm",
           },
         ],
         modalConfirmedAdd,
         () => {}
       );
       window.purchase_modal_2.showModal();
     };

     const askPrintPreference = () => {
       // Duplication print invoice

       handleConfirmationModal(
         "Print Preference 🖨",
         "Print on the basis of quantity ?",
         "Yes",
         "No",
         [
           {
             data: `🎫 Discount: ${disc}%`,
             style: "text-xl font-bold text-orange-500",
           },
           {
             data: `🗺 Location: ${formData?.itemLocation}`,
             style: "text-xl font-bold",
           },
         ],
         askForConfirmation,
         askForConfirmation,
         repetitionModal
       );

       window.print_modal_1.showModal();
     };

     if (!isEditing && isDuplicate(tempContent)) {
       handleConfirmationModal(
         "Duplicate ❓",
         "The item is already added. Do you want to add again?",
         "Yes",
         "No",
         [
           {
             data: `🎫 Discount: ${disc}%`,
             style: "text-xl font-bold text-red-500",
           },
           {
             data: `🗺 Location: ${formData?.itemLocation}`,
             style: "text-xl font-bold",
           },
           {
             data: `📜 Invoice: ${formData?.invoiceNo}`,
             style: "text-xl font-bold",
           },
           {
             data: `Party: ${formData?.partyName}`,
             style: "text-sm",
           },
           {
             data: `Item: ${formData?.itemName}`,
             style: "text-sm",
           },
         ],
         askPrintPreference,
         () => {}
       );
       window.purchase_modal_2.showModal();
     } else {
       askPrintPreference();
     }
   };

   // * create Excel file

   const createSheet = () => {
     if (excelContent.length === 0) {
       handleModal(
         "⚠ Empty",
         "The file is empty. Add one item before generating excel file.",
         "Okay"
       );
       window.purchase_modal_1.showModal();
       return;
     }

     let totalBillAmount = 0;
     const content = excelContent.map((item) => {
       totalBillAmount += parseFloat(item?.amount) || 0;
       return { ...item };
     });
     content[0].BILL_REF_AMOUNT = Math.round(totalBillAmount);

     const data = [
       {
         sheet: "Sheet1",
         columns: formData?.isIGST
           ? purchaseBillFormat
               .filter((col) => col.value !== "cgst" && col.value !== "sgst")
               .concat({
                 label: "IGST PERCENT",
                 value: "igstPercent",
                 format: "0",
               })
           : purchaseBillFormat,
         content: formData?.isIGST
           ? content.map((item) => ({
               ...item,
               igstPercent: parseInt(item?.sgst + item?.cgst),
               disc: IGSTnewDiscPercentage(
                 item?.disc,
                 parseInt(item?.sgst + item?.cgst)
               ),
               amount: IGSTnewAmount(
                 item?.mrp,
                 item?.disc,
                 parseInt(item?.quantity),
                 parseInt(item?.sgst + item?.cgst)
               ),
               purchaseType: "IGST",
             }))
           : content.map((item) => {
               return {
                 ...item,
                 purchaseType: item?.purchaseTypeText,
               };
             }),
       },
     ];

     const barcodeCustomItemName = (item) => {
       const { itemName, itemPartNo } = item;

       if (itemPartNo) {
         return itemPartNo?.split("-")?.[0] || itemPartNo;
       }

       if (itemName) {
         return itemName?.split("-")?.[0] || itemName;
       }

       return "ERROR!";
     };

     const barcodeContent = content.flatMap((item) => {
       // generate itemName

       const date = new Date(item?.originDate);
       const day = date.getDate().toString().padStart(2, "0");
       const month = (date.getMonth() + 1).toString().padStart(2, "0");
       const year = date.getFullYear().toString().slice(-2);
       const roundedDisc = Math.round(item?.disc);
       const discCode = `${
         roundedDisc < 10 ? `0${roundedDisc}` : roundedDisc
       }${day}${month}${year}`;
       const itemName = barcodeCustomItemName(item);

       return Array(item.repetition).fill({
         itemName,
         discCode,
         location: item?.itemLocation || "N/A",
         mrp: item?.mrp,
       });
     });

     const barcodeData = [
       {
         sheet: "Sheet1",
         columns: purchaseBarcodeFormat,
         content: barcodeContent,
       },
     ];

     DownloadExcel(
       content[0]?.partyName,
       content[0]?.invoiceNo,
       data,
       barcodeData
     );
     DownloadBarcodeExcel(content[0]?.invoiceNo, barcodeData);
   };

   // * download the excel file

   const DownloadExcel = (fileName, invoice, data, barcodeData) => {
     const settings = {
       fileName: `${fileName}-${invoice?.split("-")[1] || invoice}`,
       extraLength: 3,
       writeMode: "writeFile",
       writeOptions: {},
       RTL: false,
     };
     let callback = function () {
       // * send the document to purchase history
       sendPurchaseHistory(fileName, invoice, data, barcodeData);
       // * clear the localStorage
       clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA");
     };
     xlsx(data, settings, callback);
   };

   const DownloadBarcodeExcel = (invoice, data) => {
     const settings = {
       fileName: `BARCODE-${invoice?.split("-")?.[1] || invoice}`,
       extraLength: 3,
       writeMode: "writeFile",
       writeOptions: {},
       RTL: false,
     };
     let callback = function () {};
     xlsx(data, settings, callback);
   };

   // * upload the document to history

   const sendPurchaseHistory = (partyname, invoice, sheet, barcodeSheet) => {
     console.log("Barcode Data", barcodeSheet);
     console.log("Sheet Data", sheet);
     handleModal(
       "⏳ Uploading...",
       "Please wait while we upload your document...",
       "Okay"
     );
     window.purchase_modal_1.showModal();

     const payload = {
       sheetdata: JSON.stringify(sheet),
       barcodedata: JSON.stringify(barcodeSheet),
       items: sheet[0]?.content?.length,
       invoice,
       partyname,
       desc: "purchase",
     };

     const options = {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload),
     };

     fetch("/api/purchases", options)
       .then((response) => {
         if (response.status === 200) {
           // ? show modal
           handleModal("Uploaded ✔", "The document has been uploaded", "Okay");
           window.purchase_modal_1.showModal();
           clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA");
           resetSessionFields();
         } else {
           handleModal(
             "Uploaded Failed ❌",
             "Kindly re-download the document",
             "Okay"
           );
           window.purchase_modal_1.showModal();
         }
       })
       .catch((err) => {
         handleModal(
           "Uploaded Failed ❌",
           "Kindly re-download the document",
           "Okay"
         );
         window.purchase_modal_1.showModal();
       });
   };

   // * Finding the value with the selected party name and group name
   const handleFindValue = async () => {
     const partyName = formData.partyName;
     const groupName = SelectedItem?.groupName;

     if (!partyName || !groupName) return;

     // * Find the array with same party name and group name
     const getCorrespondingArray = DiscountStructure.filter((dis) => {
       if (dis.groupName === groupName && dis.partyName === partyName) {
         return dis.value;
       }
     });

     // * Get the value from the array
     const value = getCorrespondingArray[0]?.value;

     // * If the DB don't have that value
     if (!value) {
       setGotDbValue(false);
       return;
     }
     setGotDbValue(true);
     let MRP = parseFloat((formData.unitPrice * value).toFixed(2));
     if (formData?.unitPrice > 0) handleFormChange("mrp", Math.round(MRP));
     const percentageValue = SelectedItem?.discPercentage;
     let unitRate = parseFloat(
       (MRP - MRP * (percentageValue / 100)).toFixed(2)
     );

     let totAmount = parseFloat((unitRate * formData.quantity).toFixed(2));
     let totalAmount;
     if (formData?.gstType === "Exclusive") {
       let gstPercentageInt = parseInt(
         formData?.gstPercentage?.split("%")[0]?.trim()
       );
       totalAmount = parseFloat(
         (totAmount / (1 + gstPercentageInt / 100)).toFixed(2)
       );
     } else {
       totalAmount = totAmount;
     }
     if (formData?.purchaseType !== "DM" && formData?.unitPrice > 0) {
       handleFormChange("amount", totalAmount);
     }
   };

   const handleTotAmount = async () => {
     let gstValue =
       formData?.gstType === "Exempt"
         ? 0
         : parseInt(formData?.gstPercentage?.split("%")[0]?.trim());
     let disc = 0;

     if (formData?.gstType === "Exempt") {
       gstValue = 0;
       disc = ExemptCalc(formData?.mrp, formData?.amount, formData?.quantity);
     } else if (formData?.gstType === "Inclusive") {
       disc = InclusiveCalc(
         formData?.mrp,
         formData?.amount,
         formData?.quantity
       );
     } else {
       disc = ExclusiveCalc(
         formData?.mrp,
         formData?.amount,
         gstValue,
         formData?.quantity
       );
     }

     if (formData?.purchaseType === "DM" && formData?.gstType === "Exclusive")
       disc = exclusiveDM(
         formData?.mrp,
         formData?.quantity,
         formData?.mDiscPercentage,
         gstValue
       );
     else if (formData?.purchaseType === "DM") disc = formData?.mDiscPercentage;

     if (disc) {
       setDisc(disc);
     }
     // const amountField = TotalAmountCalc(
     //   formData?.mrp,
     //   disc,
     //   formData?.quantity
     // );
     // handleFormChange("amount", amountField);
   };

   useEffect(() => {
     // handleFindValue();
     handleTotAmount();
   }, [
     formData?.unitPrice,
     formData?.itemName,
     formData?.partyName,
     formData?.quantity,
   ]);

   const resetSessionFields = () => {
     setFormData({
       partyName: null,
       invoiceNo: null,
       invoiceDate: new Date(), // default date is today
       gstType: null,
       unit: "Pcs", // default value
       purchaseType: "DNM",
       mDiscPercentage: 0, // mention discount percentage
       itemName: null,
       itemPartNoOrg: null, // part no of the item
       itemLocation: null, // from item data
       quantity: 0,
       mrp: null, // D4 value
       unitPriceAfterDiscount_D6: null,
       gstPercentage: null,
       amount: null,
       finalDisc: "ERROR!",
       selectedItemRow: -1,
       isIGST: false,
       dynamicdisc: null,
       unitPrice: 0,
       repetitionPrint: 0,
       selectedData: null,
     });

     setExcelContent([]);
     setSelectedItem(null);
     toast.success("Session has been reset");
   };

   const getTotalBillAmount = () =>
     parseFloat(
       excelContent
         .map((item) => parseFloat(item?.amount))
         .reduce((acc, curr) => acc + (curr || 0), 0)
         .toFixed(0)
     );

const modifyExcelSheet = (action, code, partyName) => {
  if (action === "delete") {
    const index = excelContent.findIndex(
      (item) => item.selectedData.code === code && item.partyName === partyName
    );
    const confirmation = window.confirm(
      `Are you sure you want to delete ${excelContent?.[index]?.itemName}?`
    );

    if (confirmation) {
      // Filter out the deleted item from the state
      const updatedExcelContent = excelContent.filter(
        (content) =>
          content.selectedData.code !== code || content.partyName !== partyName
      );
      setExcelContent(updatedExcelContent); // Update localStorage as well

      const datas = localStorage.getItem("PURCHASE_NOT_DOWNLOAD_DATA");
      const parsedData = JSON.parse(datas);
      const localArray = parsedData.filter(
        (content) =>
          content.selectedData.code !== code || content.partyName !== partyName
      );
      setLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA", localArray);
    }
  } else if (action === "edit") {
    // 1. Find the exact item to be edited from the current excelContent array
    const itemToEdit = excelContent.find(
      (item) => item.selectedData.code === code && item.partyName === partyName
    ); // Exit if the item is not found

    if (!itemToEdit) {
      console.error("Could not find the item to edit.");
      return;
    } // 2. Set the editing flag

    setIsEditing(true); // 3. **Remove the item from the excelContent state** by filtering it out. //    This creates a new array without the item being edited.

    setExcelContent((prevArray) =>
      prevArray.filter(
        (item) =>
          item.selectedData.code !== code || item.partyName !== partyName
      )
    ); // 4. Use the 'itemToEdit' object we found to restore the form fields

    let totalAmount = reverseCalculateTotal(
      itemToEdit?.amount,
      itemToEdit?.gstPercentage
    );

    setSelectedItem(itemToEdit?.selectedData);
    const restoreFields = {
      partyName: itemToEdit?.partyName,
      invoiceNo: itemToEdit?.invoiceNo,
      invoiceDate: itemToEdit?.originDate,
      unitPrice: itemToEdit?.unitPrice,
      gstType: itemToEdit.gstType,
      unit: itemToEdit?.unit,
      purchaseType: itemToEdit.purchaseType,
      purchaseTypeText: itemToEdit.purchaseTypeText,
      itemName: itemToEdit?.itemName,
      itemPartNoOrg: itemToEdit?.itemPartNo,
      itemLocation: itemToEdit?.itemLocation,
      quantity: itemToEdit?.quantity,
      mrp: itemToEdit?.mrp,
      gstPercentage: itemToEdit?.gstPercentage,
      amount:
        itemToEdit?.gstType === "Exempt" || itemToEdit?.gstType === "Exclusive"
          ? totalAmount
          : itemToEdit?.amount,
      finalDisc: "ERROR!",
      isIGST: itemToEdit?.isIGST,
      dynamicdisc: itemToEdit?.disc,
      mDiscPercentage: itemToEdit?.mDiscPercentage,
      selectedData: itemToEdit?.selectedData,
      repetitionPrint: parseInt(itemToEdit?.repetitionPrint),
      creditDays: itemToEdit?.creditDays,
    };

    setFormData((prev) => ({ ...prev, ...restoreFields })); // 5. Close the preview modal

    window.saleModal_4.close();
  }
};

   const [claudeFormData, setClaudeFormData] = useState({
     partyName: "",
     invoiceNo: "",
     invoiceDate: new Date().toISOString().split("T")[0],
     unit: "Pcs",
     purchaseType: "DNM",
     quantity: 0,
     isIGST: false,
   });
   const [imageFile, setImageFile] = useState(null);
   const [apiResponse, setApiResponse] = useState(null);
   const [apiError, setApiError] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const modalRef = useRef(null);

   useEffect(() => {
     const modalElement = modalRef.current;
     if (!modalElement) return;
     if (isClaudeModalOpen) {
       modalElement.showModal();
     } else {
       // Do NOT clear apiResponse or apiError here!
       setImageFile(null);
       modalElement.close();
     }
   }, [isClaudeModalOpen]);
   const handleInvoiceEditChange = (e) => {
     const { name, value } = e.target;
     // For numeric fields, convert back to number
     const isNumeric = ["grand_total"].includes(name);
     const parsedValue = isNumeric ? parseFloat(value) || 0 : value;

     setEditedApiResponse((prev) => ({
       ...prev,
       [name]: parsedValue,
     }));
   };

   const handleItemEditChange = (e, index) => {
     const { name, value } = e.target;
     // For numeric fields, convert back to number
     const isNumeric = [
       "mrp",
       "qty",
       "cgst",
       "sgst",
       "discount",
       "amount",
     ].includes(name);
     const parsedValue = isNumeric ? parseFloat(value) || 0 : value;

     setEditedApiResponse((prev) => {
       const newItems = [...prev.items];
       newItems[index] = {
         ...newItems[index],
         [name]: parsedValue,
       };
       return {
         ...prev,
         items: newItems,
       };
     });
   };

   const handleClaudeReset = () => {
     setImageFile(null);
     setApiResponse(null);
     setApiError(null);
     setEditedApiResponse(null);
     setEditingInvoice(false);
     setEditingItemIndex(null);
     setAddedItems(new Set());
   };

   const handleClaudeImageChange = (e) => {
     if (e.target.files.length > 0) {
       setImageFile(e.target.files[0]);
     }
   };

   const handleClaudeSubmit = async (e) => {
     e.preventDefault();
     setApiResponse(null);
     setApiError(null);
     setIsSubmitting(true);

     try {
       const data = new FormData();
       if (imageFile) {
         data.append("invoices", imageFile); // multiple allowed if needed
       }
       Object.keys(claudeFormData).forEach((key) => {
         data.append(key, claudeFormData[key]);
       });

       const response = await fetch("/api/claude-ai", {
         method: "POST",
         body: data,
       });

       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }

       const responseData = await response.json();
       setApiResponse(responseData);
       //  console.log(apiResponse);
       setEditedApiResponse(JSON.parse(JSON.stringify(responseData)));
     } catch (error) {
       console.error("Error calling API:", error);
       setApiError("Failed to process the request. Please try again.");
     } finally {
       setIsSubmitting(false);
     }
   };

   const handleAddtoPurchase = (item, apiResponse) => {
     // setIsClaudeModalOpen(false);
     if (!item || !apiResponse) return;

     // 1. Clean the incoming part number: remove special chars, spaces, and convert to uppercase.
     const cleanedPartNo = (item.part_no || "")
       .toString()
       .replace(/[^a-zA-Z0-9]/g, "") // This regex removes anything that is NOT a letter or number
       .toUpperCase();

     // Exit if the part number is empty after cleaning
     if (!cleanedPartNo) return;

     // 2. Update the search logic to use the cleaned part number.
     const matched =
       itemData?.find((i) => {
         // Clean the local part number for a consistent comparison
         const localPartNo = (i.partNumber || "")
           .toString()
           .replace(/[^a-zA-Z0-9]/g, "")
           .toUpperCase();

         // Clean the local item name for a consistent comparison
         const localItemName = (i.itemName || "")
           .toString()
           .replace(/[^a-zA-Z0-9]/g, "")
           .toUpperCase();

         // Check if the cleaned local data starts with the cleaned incoming part number
         return (
           localPartNo.startsWith(cleanedPartNo) ||
           localItemName.startsWith(cleanedPartNo)
         );
       }) || null;

     // prefer matched record for filling form, fallback to incoming item values
     setSelectedItem(matched ?? item);
     handleFormChange("selectedData", matched ?? null);
     handleFormChange("invoiceNo", apiResponse?.invoice_no.toUpperCase() || "");
     if (apiResponse?.invoice_date) {
       const parsedDate = parseDDMMYYYY(apiResponse.invoice_date);
       handleFormChange("invoiceDate", parsedDate || new Date());
     }

     // reset some fields
     handleFormChange("quantity", item?.qty || 1);
     handleFormChange("amount", item?.amount || 0);

     // fill fields from matched if available, otherwise from item
     handleFormChange("itemName", matched?.itemName ?? item?.part_no);
     handleFormChange("unit", matched?.unitName ?? item?.unitName ?? "Pcs");
     handleFormChange("unitPrice", matched?.unitPrice ?? "");
     handleFormChange("itemPartNoOrg", matched?.partNumber ?? item?.part_no);
     handleFormChange("mrp", matched?.unitPrice ?? item?.mrp ?? 0);
     handleFormChange(
       "unitPriceAfterDiscount_D6",
       matched?.unitPriceAfterDiscount ?? item?.unitPriceAfterDiscount ?? ""
     );
     handleFormChange(
       "itemLocation",
       matched?.storageLocation || item?.storageLocation || "Not Available"
     );

     // set GST only when GST type isn't Exempt (mirrors Select onChange behavior)
     // set GST only when GST type isn't Exempt (mirrors Select onChange behavior)
     if (formData?.gstType !== "Exempt") {
       // Combine cgst and sgst, providing a fallback of 0 if they don't exist.
       const totalGstRate = (item?.cgst || 0) + (item?.sgst || 0);

       // Format the number into the expected string format, e.g., "18 %".
       const gstStringFormat = `${totalGstRate} %`;

       // Update the form state with the correctly formatted string.
       handleFormChange("gstPercentage", gstStringFormat);
     }
     const itemQty = item?.qty || 1;

     // Set both quantity and repetitionPrint to ensure consistency
     handleFormChange("quantity", itemQty);
     handleFormChange("repetitionPrint", itemQty);
     setAddedItems((prev) => new Set(prev).add(item.part_no));
   };
   return (
     <>
       <Toaster />
       <dialog id="purchase_modal_1" className="modal">
         <form method="dialog" className="modal-box">
           <h3 className="font-bold text-lg">{modalMessage?.title}</h3>
           <p className="py-4">{modalMessage?.message}</p>
           <div className="modal-action">
             {/* if there is a button in form, it will close the modal */}
             <button className="btn">{modalMessage?.button}</button>
           </div>
         </form>
       </dialog>
       <dialog id="purchase_modal_2" className="modal">
         <form method="dialog" className="modal-box">
           <h3 className="font-bold text-lg">{modalConfirmation?.title}</h3>
           <p className="py-4">{modalConfirmation?.message}</p>
           {
             // * if there is a message array, it will show the message
             modalConfirmation?.messages?.map((e, i) => {
               return (
                 <p key={i} className={[`${e?.style} text-teal-700`]}>
                   {e?.data}
                 </p>
               );
             })
           }
           <div className="modal-action">
             {/* if there is a button in form, it will close the modal */}
             <button
               onClick={() => modalConfirmation?.btn_f_1()}
               className="btn"
             >
               {modalConfirmation?.button_1}
             </button>
             <button
               onClick={() => modalConfirmation?.btn_f_2()}
               className="btn"
             >
               {modalConfirmation?.button_2}
             </button>
           </div>
         </form>
       </dialog>

       {/* Print repetition modal */}

       <dialog id="print_modal_1" className="modal">
         <form method="dialog" className="modal-box">
           <h3 className="font-bold text-lg">{modalConfirmation?.title}</h3>
           <p className="py-4">{modalConfirmation?.message}</p>
           {
             // * if there is a message array, it will show the message
             modalConfirmation?.messages?.map((e, i) => {
               return (
                 <p key={i} className={[`${e?.style} text-teal-700`]}>
                   {e?.data}
                 </p>
               );
             })
           }
           <label className="text-yellow-300">Quantity</label>
           <input
             onWheel={(e) => {
               e.target.blur();
             }}
             value={formData?.repetitionPrint || ""}
             className="input input-bordered input-secondary m-5 uppercase w-[295px]"
             placeholder={`No. of prints ${formData?.quantity}`}
             type="number"
             name="repetitionPrint"
             onChange={(e) => {
               modalConfirmation.norm_f_3(parseInt(e.target.value));
             }}
           />

           <div className="modal-action">
             {/* if there is a button in form, it will close the modal */}
             <button
               onClick={() => modalConfirmation?.btn_f_1("YES")}
               className="btn"
             >
               {modalConfirmation?.button_1}
             </button>
             <button
               onClick={() => modalConfirmation?.btn_f_2("NO")}
               className="btn"
             >
               {modalConfirmation?.button_2}
             </button>
           </div>
         </form>
       </dialog>

       <p className="text-center text-3xl font-bold mb-4">Purchase Section</p>
       <div className="text-center m-auto">
         {loadingExcel && (
           <span className="loading loading-infinity w-[80px] text-sky-500"></span>
         )}

         <div className="m-5 flex justify-between flex-col">
           {partyData?.length > 0 && (
             <Select
               filterOption={createFilter({ ignoreAccents: false })}
               components={{ Option: CustomOption, MenuList: CustomMenuList }}
               placeholder="Select party name"
               className="w-full m-auto p-5 text-blue-800 font-bold"
               getOptionLabel={(option) => `${option["value"]}`}
               options={partyData}
               value={
                 formData?.partyName && {
                   value: formData.partyName,
                   creditDays: formData?.creditDays,
                 }
               }
               onChange={(e) => {
                 handleFormChange("partyName", e?.value);
                 handleFormChange(
                   "creditDays",

                   isNaN(e?.creditDays) || e?.creditDays === ""
                     ? 0
                     : e?.creditDays
                 );
                 setLocalStorage("US_PN_REFERER", e?.value);
               }}
               noOptionsMessage={() => {
                 return (
                   <p
                     onClick={() => toast.error("This is not yet done.")}
                     className="hover:cursor-pointer"
                   >
                     ➕ Add Party
                   </p>
                 );
               }}
             />
           )}

           <div className="flex justify-center items-center flex-wrap">
             <input
               placeholder="Enter invoice no"
               className="input input-bordered input-secondary m-5 w-[295px]"
               type="text"
               disabled={excelContent?.length > 0}
               value={formData?.invoiceNo || ""}
               onChange={(e) => {
                 handleFormChange("invoiceNo", e.target.value?.toUpperCase());
               }}
             />

             <DatePicker
               className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
               placeholderText="Select invoice date"
               showPopperArrow={true}
               maxDate={new Date()}
               todayButton="Today"
               dateFormat="dd/MM/yyyy"
               selected={formData?.invoiceDate ?? new Date()}
               onChange={(selectedDate) => {
                 handleFormChange("invoiceDate", selectedDate);
                 setLocalStorage("US_INV_DATE", selectedDate);
               }}
             />
           </div>

           <Select
             placeholder="Select GST type"
             isSearchable={false}
             className="w-full m-auto p-5 text-blue-800 font-bold"
             options={gstType}
             getOptionLabel={(option) => `${option["value"]}`}
             value={formData?.gstType && { value: formData.gstType }}
             onChange={(e) => {
               if (e?.value === "Exempt") {
                 handleFormChange("gstPercentage", 0);
               }
               handleFormChange("gstType", e.value);
               handleFormChange("unitPrice", 0);
               handleFormChange("quantity", 0); // clearing the fields
               handleFormChange("amount", 0); // clearing the fields
             }}
           />

           <div>
             <Select
               placeholder="Select Purchase Type"
               className="w-full m-auto p-5 text-blue-800 font-bold"
               isSearchable={false}
               options={purchasetype}
               onChange={(e) => {
                 if (e?.value === "DM") {
                   // * whenever the purchase type is DM, the amount field will be hidden & zero.
                   handleFormChange("amount", 0);
                 }
                 handleFormChange("purchaseType", e.value);
               }}
               value={
                 formData?.purchaseType && {
                   label: `${
                     formData?.purchaseType === "DNM"
                       ? "Discount Not Mentioned"
                       : "Discount Mentioned"
                   }`,
                   value: formData.purchaseType,
                 }
               }
               defaultValue={{ label: "Discount Not Mentioned", value: "DNM" }}
               isClearable={false}
             />
             {/* IGST Purchase Type */}
             <Select
               placeholder="PURCHASE TYPE (IGST) ?"
               className="w-full m-auto p-5 text-blue-800 font-bold"
               isSearchable={false}
               options={choiceIGST}
               onChange={(e) => {
                 handleFormChange("isIGST", e?.value);
               }}
               value={{
                 label: formData?.isIGST
                   ? "Choose IGST? (YES)"
                   : "Choose IGST? (NO)",
                 value: formData?.isIGST,
               }}
               defaultValue={{ label: "Choose IGST? (NO)", value: "NO" }}
               isClearable={false}
             />
             <input
               hidden={formData?.purchaseType === "DNM"}
               value={formData?.mDiscPercentage || ""}
               onChange={(e) => {
                 handleFormChange("mDiscPercentage", e.target.value);
               }}
               className="input input-bordered input-secondary w-[295px] m-5"
               placeholder="Mentioned Discount %"
               type="number"
               onWheel={(e) => {
                 e.target.blur();
               }}
             />
           </div>

           {/* Item DropDown */}
           {itemData?.length > 0 && (
             <Select
               filterOption={createFilter({ ignoreAccents: false })}
               components={{ Option: CustomOption, MenuList: CustomMenuList }}
               placeholder="Select an item"
               className="w-full m-auto p-5 text-blue-800 font-bold"
               options={itemData}
               value={SelectedItem}
               onChange={(e) => {
                 if (!formData?.gstType) {
                   toast.error("Select GST Type");
                   return;
                 }

                 console.log("Selected Item: ", e);
                 setSelectedItem(e);
                 handleFormChange("selectedData", e);
                 handleFormChange("quantity", 0); // clearing the fields
                 handleFormChange("amount", 0); // clearing the fields
                 handleFormChange("itemName", e.itemName);
                 handleFormChange("unit", e?.unitName);
                 handleFormChange("unitPrice", "");
                 handleFormChange("itemPartNoOrg", e.partNumber);
                 handleFormChange("mrp", e?.unitPrice);
                 handleFormChange(
                   "unitPriceAfterDiscount_D6",
                   e?.unitPriceAfterDiscount
                 );
                 handleFormChange(
                   "itemLocation",
                   e?.storageLocation || "Not Available"
                 );

                 if (formData?.gstType === "Exempt") {
                   // * if gst type is exempt, then it will not modify the gst percentage
                   handleFormChange("gstPercentage", 0);
                 }
               }}
               getOptionLabel={(option) =>
                 `${option["itemName"]} ${option["partNumber"]}`
               }
               formatOptionLabel={({ itemName }) => (
                 <div className="flex justify-between">
                   <p className="text-black">{itemName}</p>
                 </div>
               )}
               noOptionsMessage={() => {
                 return <p>Add the item inn BDS file first then refresh.</p>;
               }}
             />
           )}

           {/* Quantity field */}

           <div>
             <input
               onChange={(e) => {
                 if (!formData?.itemName) {
                   toast.error("Select an item");
                   return;
                 }

                 handleFormChange("quantity", e.target.value);
                 handleFormChange("repetitionPrint", e.target.value); // by default the repetition print will be the quantity

                 // * If we got the value from the DB then return
                 if (gotDbValue && formData?.unitPrice) {
                   return;
                 }

                 // when dynamic discount is available
                 if (formData?.dynamicdisc && !isNaN(formData?.dynamicdisc)) {
                   let unitPrice = 0;

                   if (formData?.gstType === "Exclusive") {
                     unitPrice = unitPriceCalcExclDISC(
                       formData?.mrp,
                       formData?.dynamicdisc,
                       formData?.gstPercentage?.replace("%", "")
                     );
                   } else {
                     // * if gst type is exempt & inclusive
                     unitPrice = unitPriceCalcEXemptInclDISC(
                       formData?.mrp,
                       formData?.dynamicdisc
                     );
                   }

                   // handleFormChange("amount", unitPrice * e.target.value);
                 } else if (formData?.unitPriceAfterDiscount_D6) {
                   if (formData?.gstType === "Exclusive") {
                     const exclusiveTotalAmount = exclusiveTaxTotalAmount(
                       formData.unitPriceAfterDiscount_D6,
                       e.target.value,
                       formData?.gstPercentage
                     );
                     // handleFormChange("amount", exclusiveTotalAmount);
                   } else {
                     const inclExemptTotalAmount =
                       inclusiveExemptTaxTotalAmount(
                         formData?.unitPriceAfterDiscount_D6,
                         e.target.value
                       );
                     // handleFormChange("amount", inclExemptTotalAmount);
                   }
                 }
               }}
               className="input input-bordered input-secondary w-[295px] m-5"
               placeholder="Quantity"
               type="number"
               onWheel={(e) => {
                 e.target.blur();
               }}
               value={formData?.quantity || ""}
             />
             <input
               onChange={(e) => {
                 handleFormChange("unitPrice", e.target.value);
               }}
               value={gotDbValue ? formData?.unitPrice : "N/A"}
               className="input input-bordered input-secondary w-[295px] m-5"
               placeholder="Unit Price"
               type={`${gotDbValue ? "number" : "text"}`}
               onWheel={(e) => {
                 e.target.blur();
               }}
               disabled={!gotDbValue}
             />
             <input
               onChange={(e) => {
                 handleFormChange("mrp", e.target.value);
               }}
               value={formData?.mrp || ""}
               className="input input-bordered input-secondary w-[295px] m-5"
               placeholder="MRP"
               type="number"
               onWheel={(e) => {
                 e.target.blur();
               }}
             />
           </div>
           <Select
             isDisabled={formData?.gstType === "Exempt"}
             placeholder="Select GST %"
             isSearchable={false}
             className="w-full m-auto p-5 text-blue-800 font-bold"
             options={gstAmount}
             getOptionLabel={(option) => `${option["value"]}`}
             value={
               formData.gstPercentage ? { value: formData.gstPercentage } : null
             }
             onChange={(e) => {
               handleFormChange("gstPercentage", e.value);
             }}
           />

           {/* {!loadingExcel && (
             <Select
               isDisabled={formData?.gstType === "Exempt"}
               placeholder="Select GST %"
            
               className="w-full m-auto p-5 text-blue-800 font-bold"
               options={gstAmount}
               getOptionLabel={(option) => `${option["value"]}`}
               //  value={
               //    SelectedItem?.gstPercentage && {
               //      value: SelectedItem?.gstPercentage,
               //    }
               //  }
               onChange={(e) => {
                 handleFormChange("gstPercentage", e.value);
               }}
             />
           )} */}
         </div>

         <input
           onChange={(e) => {
             handleFormChange("itemLocation", e.target.value);
           }}
           value={formData?.itemLocation || ""}
           className={"input input-bordered  w-[295px] m-5 input-accent"}
           placeholder="Item Location"
           type="text"
         />

         <input
           onChange={(e) => {
             handleFormChange("amount", e.target.value);
           }}
           value={formData?.amount || ""}
           className={[
             "input input-bordered  w-[295px] m-5",
             formData?.dynamicdisc !== "N/A"
               ? "input-primary"
               : "input-secondary",
           ].join(" ")}
           placeholder="Total Amount"
           type="number"
           hidden={formData?.purchaseType === "DM"}
           onWheel={(e) => {
             e.target.blur();
           }}
         />
         <br />
       </div>
       <dialog id="saleModal_4" className="modal">
         <form method="dialog" className="modal-box">
           <h3 className="font-bold text-lg">Preview </h3>
           <span className="text-sky-300 animate-pulse text-sm">
             {formData?.partyName === "PHONE PE" ||
             formData?.partyName === "Cash" ? (
               <span>{formData?.partyName}</span>
             ) : null}
           </span>
           <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
             <table className="table">
               {/* head */}
               <thead>
                 <tr>
                   <th>Sl No.</th>
                   <th>Item</th>
                   <th>Action</th>
                   <th>Party Name</th>
                   <th>Invoice No</th>
                   <th>Invoice Date</th>
                   <th>Gst Type</th>
                   <th>Unit</th>
                   <th>Purchase Type</th>
                   {/* <th>Item Part No</th>
                  <th>Item Part Organisation</th> */}
                   <th>Item Location</th>
                   <th>Qty</th>
                   <th>MRP</th>
                   <th>Disc%</th>
                   <th>Tot. Amount</th>
                 </tr>
               </thead>
               <tbody>
                 {/* row 1 */}

                 {excelContent.map((item, index) => {
                   // console.log("Item", item);
                   return (
                     <tr key={index} className="hover:bg-indigo-950">
                       <th>{index + 1}</th>
                       <td>{item?.itemName}</td>
                       <td>
                         <div className="flex flex-col gap-2">
                           <button
                             onClick={() =>
                               modifyExcelSheet(
                                 "edit",
                                 item.selectedData.code,
                                 item.partyName
                               )
                             }
                             className="btn btn-sm btn-warning"
                           >
                             Edit
                           </button>
                           <button
                             onClick={() =>
                               modifyExcelSheet(
                                 "delete",
                                 item.selectedData.code,
                                 item.partyName
                               )
                             }
                             className="btn btn-sm btn-error"
                           >
                             Delete
                           </button>
                         </div>
                       </td>
                       <td>{item?.partyName}</td>
                       <td>{item?.invoiceNo}</td>
                       <td>{item?.billDate}</td>
                       <td>{item?.gstType}</td>
                       <td>{item?.unit}</td>
                       <td>{item?.purchaseTypeText}</td>
                       {/* <td>{item?.itemName}</td>
                      <td>{item?.itemPartNo}</td> */}
                       <td>{item?.itemLocation}</td>
                       <td>{item?.quantity}</td>
                       <td>{item?.mrp}</td>
                       <td>{item?.disc}</td>
                       <td>{item?.amount}</td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
             <div className="ml-2 mb-2">
               Bill Amount:{" "}
               <span className="font-extrabold">{getTotalBillAmount()}</span>
             </div>
           </div>
           <div className="flex justify-center items-center mt-4 bg-indigo-950 rounded-lg p-3">
             <div className="flex flex-col gap-2 w-[50%] items-center">
               <div className="flex flex-col gap-2">
                 <input
                   name="cashPayment"
                   value={formData?.cashPayment || ""}
                   type="number"
                   className="input input-bordered input-secondary w-full"
                   placeholder="Cash"
                   min={0} // Prevents negative values
                   onWheel={(e) => {
                     e.target.blur();
                   }}
                   onChange={(e) => {
                     // handleChange(e);
                     // const value = Math.max(0, e.target.value); // Ensure non-negative value
                     // handleInputSettlement("cash", value);
                   }}
                 />
                 <input
                   name="bankPayment"
                   value={formData?.bankPayment || ""}
                   onChange={(e) => {
                     // handleChange(e);
                     // const value = Math.max(0, e.target.value); // Ensure non-negative value
                     // handleInputSettlement("online", value);
                   }}
                   type="number"
                   className="input input-bordered input-secondary w-full"
                   placeholder="Bank"
                   min={0} // Prevents negative values
                   onWheel={(e) => {
                     e.target.blur();
                   }}
                 />
               </div>
               <div
                 onClick={() => {
                   handleFormChange("cashPayment", "");
                   handleFormChange("bankPayment", "");
                   toast.success("Cleared the payment fields");
                 }}
                 className="btn bg-yellow-600 hover:bg-yellow-800 w-full"
               >
                 Clear
               </div>
             </div>
           </div>
           <div className="modal-action">
             <button className="btn bg-red-600">Cancel</button>
             <button onClick={createSheet} className="btn bg-green-600">
               Download
             </button>
           </div>
         </form>
       </dialog>

       <div className="py-20"></div>
       {/* Bottom Nav Bar */}
       <div className="btm-nav glass bg-blue-800">
         <button
           onClick={() => {
             if (isFormValidated(formData)) {
               addSingleFormContent();
             }
           }}
           className="text-white hover:bg-blue-900"
         >
           <Image
             className="mb-20"
             src="/assets/images/add-button.png"
             width={80}
             height={80}
             alt="icon"
           ></Image>
         </button>
         <button
           onClick={() => {
             // createSheet();
             if (excelContent?.length === 0) {
               toast.error("No item has been added");
               return;
             }

             window.saleModal_4.showModal();
           }}
           className=" text-white hover:bg-blue-900"
         >
           <Image
             src="/assets/images/download (1).png"
             width={50}
             height={50}
             alt="icon"
           ></Image>
           <span className="mb-6 text-xl font-mono">Preview</span>
         </button>
         <button
           onClick={() => setClaudeModalOpen(true)}
           className="flex items-center gap-2 p-3 rounded-lg bg-blue-700 text-white hover:bg-blue-900"
         >
           <Image
             src="/assets/images/uploadfile.png"
             width={40}
             height={40}
             alt="icon"
           />
           <span className="text-lg font-mono">AI</span>
         </button>

         <button
           onClick={() => {
             getItemsData();
           }}
           className="text-white hover:bg-blue-900"
         >
           <Image
             src="/assets/images/refresh-arrow.png"
             width={50}
             height={50}
             alt="icon"
           ></Image>
           <span className="mb-6 text-xl font-mono">Refresh</span>
         </button>
         <button
           onClick={() => {
             clearLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA");
             resetSessionFields();
           }}
           className="text-white hover:bg-blue-900"
         >
           <Image
             src="/assets/images/remove.png"
             width={50}
             height={50}
             alt="icon"
           ></Image>
           <span className="mb-6 text-xl font-mono">Reset</span>
         </button>
       </div>
       <dialog
         id="my_modal_1"
         ref={modalRef}
         className="modal modal-bottom sm:modal-middle"
         onClose={() => setClaudeModalOpen(false)}
       >
         <div className="modal-box bg-base-100 relative max-w-5xl max-h-[90vh] flex flex-col">
           {/* --- MODAL HEADER --- */}
           <h2 className="text-3xl font-extrabold text-primary">
             Import Details
           </h2>
           <div className="divider mt-2 mb-6"></div>

           {/* --- MODAL CONTENT --- */}
           <div className="flex-grow overflow-y-auto pr-4 -mr-4">
             {/* Show results view if we have an API response, otherwise show the form */}
             {editedApiResponse ? (
               <div className="flex flex-col gap-6">
                 {/* --- SUCCESS/ERROR ALERTS --- */}
                 {apiResponse && (
                   <div role="alert" className="alert alert-success">
                     <svg
                       xmlns="http://www.w3.org/2000/svg"
                       className="stroke-current shrink-0 h-6 w-6"
                       fill="none"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth="2"
                         d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                       />
                     </svg>
                     <span>
                       {apiResponse.message ||
                         "Request successful! Here is the response:"}
                     </span>
                   </div>
                 )}
                 {apiError && (
                   <div role="alert" className="alert alert-error">
                     <svg
                       xmlns="http://www.w3.org/2000/svg"
                       className="stroke-current shrink-0 h-6 w-6"
                       fill="none"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth="2"
                         d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                       />
                     </svg>
                     <span>Error: {apiError}</span>
                   </div>
                 )}

                 {/* --- INVOICE SUMMARY CARD --- */}
                 <div className="card bg-base-200/50 border border-base-300">
                   <div className="card-body p-4 md:p-6">
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="card-title">Invoice Summary</h3>
                       {editingInvoice ? (
                         <button
                           onClick={() => setEditingInvoice(false)}
                           className="btn btn-sm btn-success btn-circle"
                         >
                           <svg
                             xmlns="http://www.w3.org/2000/svg"
                             className="h-5 w-5"
                             fill="none"
                             viewBox="0 0 24 24"
                             stroke="currentColor"
                             strokeWidth={2}
                           >
                             <path
                               strokeLinecap="round"
                               strokeLinejoin="round"
                               d="M5 13l4 4L19 7"
                             />
                           </svg>
                         </button>
                       ) : (
                         <button
                           onClick={() => setEditingInvoice(true)}
                           className="btn btn-sm btn-ghost btn-circle"
                         >
                           <svg
                             xmlns="http://www.w3.org/2000/svg"
                             className="h-5 w-5"
                             viewBox="0 0 20 20"
                             fill="currentColor"
                           >
                             <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                             <path
                               fillRule="evenodd"
                               d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                               clipRule="evenodd"
                             />
                           </svg>
                         </button>
                       )}
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                       <div className="flex flex-col">
                         <span className="text-base-content/60">Invoice #</span>
                         {editingInvoice ? (
                           <input
                             type="text"
                             name="invoice_no"
                             value={editedApiResponse.invoice_no}
                             onChange={handleInvoiceEditChange}
                             className="input input-bordered input-sm"
                           />
                         ) : (
                           <span className="font-bold text-base">
                             {editedApiResponse.invoice_no}
                           </span>
                         )}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-base-content/60">Date</span>
                         {editingInvoice ? (
                           <input
                             type="text"
                             name="invoice_date"
                             value={editedApiResponse.invoice_date}
                             onChange={handleInvoiceEditChange}
                             className="input input-bordered input-sm"
                           />
                         ) : (
                           <span className="font-bold text-base">
                             {editedApiResponse.invoice_date}
                           </span>
                         )}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-base-content/60">Format</span>
                         <span className="font-bold text-base">
                           {editedApiResponse.format}
                         </span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-base-content/60">
                           Grand Total
                         </span>
                         {editingInvoice ? (
                           <input
                             type="number"
                             name="grand_total"
                             value={editedApiResponse.grand_total}
                             onChange={handleInvoiceEditChange}
                             className="input input-bordered input-sm"
                           />
                         ) : (
                           <span className="font-bold text-primary text-lg">
                             ₹
                             {editedApiResponse.grand_total.toLocaleString(
                               "en-IN"
                             )}
                           </span>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* --- ITEMS LIST --- */}
                 <h3 className="text-xl font-bold mt-2">Extracted Items</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                   {editedApiResponse.items?.map((item, idx) => {
                     const isEditingThisItem = editingItemIndex === idx;
                     return (
                       <div
                         key={idx}
                         className="card border border-base-300 bg-base-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary"
                       >
                         <div className="card-body p-5">
                           <div className="flex items-center justify-between">
                             <div className="card-title flex-grow">
                               {isEditingThisItem ? (
                                 <input
                                   type="text"
                                   name="part_no"
                                   value={item.part_no}
                                   onChange={(e) =>
                                     handleItemEditChange(e, idx)
                                   }
                                   className="input input-bordered input-sm w-full"
                                 />
                               ) : (
                                 <div className="flex items-center gap-2">
                                   Part No:{" "}
                                   <span className="text-secondary">
                                     {item.part_no}
                                   </span>
                                   {addedItems.has(item.part_no) && (
                                     <span className="badge badge-success badge-outline">
                                       Added
                                     </span>
                                   )}
                                 </div>
                               )}
                             </div>
                             {isEditingThisItem ? (
                               <button
                                 onClick={() => setEditingItemIndex(null)}
                                 className="btn btn-sm btn-success btn-circle ml-2"
                               >
                                 <svg
                                   xmlns="http://www.w3.org/2000/svg"
                                   className="h-5 w-5"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                                   strokeWidth={2}
                                 >
                                   <path
                                     strokeLinecap="round"
                                     strokeLinejoin="round"
                                     d="M5 13l4 4L19 7"
                                   />
                                 </svg>
                               </button>
                             ) : (
                               <button
                                 onClick={() => setEditingItemIndex(idx)}
                                 className="btn btn-sm btn-ghost btn-circle ml-2"
                               >
                                 <svg
                                   xmlns="http://www.w3.org/2000/svg"
                                   className="h-5 w-5"
                                   viewBox="0 0 20 20"
                                   fill="currentColor"
                                 >
                                   <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                   <path
                                     fillRule="evenodd"
                                     d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                     clipRule="evenodd"
                                   />
                                 </svg>
                               </button>
                             )}
                           </div>
                           <div className="divider my-1"></div>
                           <div className="space-y-2 text-sm mt-2">
                             <div className="flex justify-between items-center">
                               <span className="font-medium text-base-content/70">
                                 MRP
                               </span>
                               {isEditingThisItem ? (
                                 <input
                                   type="number"
                                   name="mrp"
                                   value={item.mrp}
                                   onChange={(e) =>
                                     handleItemEditChange(e, idx)
                                   }
                                   className="input input-bordered input-sm w-24 text-right"
                                 />
                               ) : (
                                 <span className="font-semibold">
                                   ₹{item.mrp.toLocaleString("en-IN")}
                                 </span>
                               )}
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="font-medium text-base-content/70">
                                 Quantity
                               </span>
                               {isEditingThisItem ? (
                                 <input
                                   type="number"
                                   name="qty"
                                   value={item.qty}
                                   onChange={(e) =>
                                     handleItemEditChange(e, idx)
                                   }
                                   className="input input-bordered input-sm w-24 text-right"
                                 />
                               ) : (
                                 <span className="font-semibold">
                                   {item.qty}
                                 </span>
                               )}
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="font-medium text-base-content/70">
                                 CGST / SGST (%)
                               </span>
                               {isEditingThisItem ? (
                                 <div className="flex gap-1">
                                   <input
                                     type="number"
                                     name="cgst"
                                     value={item.cgst}
                                     onChange={(e) =>
                                       handleItemEditChange(e, idx)
                                     }
                                     className="input input-bordered input-sm w-16 text-right"
                                   />
                                   <input
                                     type="number"
                                     name="sgst"
                                     value={item.sgst}
                                     onChange={(e) =>
                                       handleItemEditChange(e, idx)
                                     }
                                     className="input input-bordered input-sm w-16 text-right"
                                   />
                                 </div>
                               ) : (
                                 <span className="font-semibold">
                                   {item.cgst}% / {item.sgst}%
                                 </span>
                               )}
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="font-medium text-base-content/70">
                                 Discount (%)
                               </span>
                               {isEditingThisItem ? (
                                 <input
                                   type="number"
                                   name="discount"
                                   value={item.discount}
                                   onChange={(e) =>
                                     handleItemEditChange(e, idx)
                                   }
                                   className="input input-bordered input-sm w-24 text-right"
                                 />
                               ) : (
                                 <span className="badge badge-accent badge-outline">
                                   {item.discount}%
                                 </span>
                               )}
                             </div>
                             <div className="flex justify-between items-center text-base mt-2 pt-2 border-t border-base-200">
                               <span className="font-bold">Amount</span>
                               {isEditingThisItem ? (
                                 <input
                                   type="number"
                                   name="amount"
                                   value={item.amount}
                                   onChange={(e) =>
                                     handleItemEditChange(e, idx)
                                   }
                                   className="input input-bordered input-sm w-24 text-right"
                                 />
                               ) : (
                                 <span className="font-extrabold text-primary">
                                   ₹{item.amount.toLocaleString("en-IN")}
                                 </span>
                               )}
                             </div>
                           </div>
                           <div className="card-actions justify-end mt-4">
                             <button
                               onClick={() =>
                                 handleAddtoPurchase(item, editedApiResponse)
                               }
                               className="btn btn-primary btn-sm"
                             >
                               {addedItems.has(item.part_no)
                                 ? "Add Again"
                                 : "Add to Purchase"}
                             </button>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ) : (
               /* --- UPLOAD FORM --- */
               <form
                 className="flex flex-col h-full"
                 onSubmit={handleClaudeSubmit}
               >
                 <div className="flex-grow flex items-center justify-center">
                   <div className="form-control w-full max-w-md">
                     <label className="label">
                       <span className="label-text">
                         Select an invoice image
                       </span>
                     </label>
                     <input
                       type="file"
                       name="image"
                       onChange={handleClaudeImageChange}
                       className="file-input file-input-primary w-full"
                       required
                       disabled={isSubmitting}
                     />
                     <label className="label">
                       <span className="label-text-alt">
                         Supported formats: JPG, PNG, WEBP
                       </span>
                     </label>
                   </div>
                 </div>
               </form>
             )}
           </div>

           {/* --- MODAL ACTIONS (FOOTER) --- */}
           <div className="divider mt-6 mb-2"></div>
           <div className="modal-action mt-0">
             {editedApiResponse || apiError ? (
               <div className="flex w-full items-center justify-between">
                 <button
                   type="button"
                   onClick={handleClaudeReset}
                   className="btn btn-warning"
                 >
                   Reset & Scan Another
                 </button>
                 <form method="dialog" className="inline-flex">
                   <button className="btn btn-primary">Close</button>
                 </form>
               </div>
             ) : (
               <form method="dialog" className="w-full">
                 <div className="flex justify-end gap-3">
                   <button
                     type="button"
                     onClick={() => setClaudeModalOpen(false)}
                     className="btn btn-ghost"
                     disabled={isSubmitting}
                   >
                     Cancel
                   </button>
                   <button
                     type="button"
                     onClick={handleClaudeSubmit}
                     className="btn btn-primary flex items-center gap-2"
                     disabled={isSubmitting || !imageFile}
                   >
                     {isSubmitting ? (
                       <>
                         <span className="loading loading-spinner loading-sm"></span>
                         Processing...
                       </>
                     ) : (
                       "Fetch Details"
                     )}
                   </button>
                 </div>
               </form>
             )}
           </div>
         </div>
         {/* Closes the modal on outside click */}
         <form method="dialog" className="modal-backdrop">
           <button>close</button>
         </form>
       </dialog>
     </>
   );
}
