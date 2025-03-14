"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import { useState, useEffect } from "react";
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
  // const [qrResult, setQrResult] = useState("");
  // const [barcodeScannedData, setBarcodeScannedData] = useState(null);
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
  });
  const [SelectedItem, setSelectedItem] = useState(null);
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
        let dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

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
        key === "unitPrice"
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
    let disc = 0;
    let purchaseType = "";
    let eligibility = "Goods/Services";
    let bill = "GST";
    let cgst = 0;
    // * discount calculation

    if (formData?.gstType === "Exempt") {
      gstValue = 0;
      bill = "Main";
      cgst = 0;
      purchaseType = "EXEMPT";
      disc = ExemptCalc(formData?.mrp, formData?.amount, formData?.quantity);
      eligibility = "None";
    } else if (formData?.gstType === "Inclusive") {
      purchaseType = "GST(INCL)";
      disc = InclusiveCalc(formData?.mrp, formData?.amount, formData?.quantity);
      cgst = parseInt(gstValue / 2);
    } else {
      purchaseType = "GST(INCL)";
      disc = ExclusiveCalc(
        formData?.mrp,
        formData?.amount,
        gstValue,
        formData?.quantity
      );
      cgst = parseInt(gstValue / 2);
    }

    if (formData?.purchaseType === "DM" && formData?.gstType === "Exclusive")
      disc = exclusiveDM(
        formData?.mrp,
        formData?.quantity,
        formData?.mDiscPercentage,
        gstValue
      );
    else if (formData?.purchaseType === "DM") disc = formData?.mDiscPercentage;

    // calculate the Total amount:

    const amountField = TotalAmountCalc(
      formData?.mrp,
      disc,
      formData?.quantity
    );

    // * setting the content after all operations

    const tempContent = {
      billSeries: bill,
      billDate: dateToFormattedString(formData?.invoiceDate),
      originDate: formData?.invoiceDate,
      purchaseType: formData?.purchaseType,
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
      if (excelContent.length !== 0) {
        setExcelContent((prevArray) => {
          const newArr = prevArray.filter(
            (item) =>
              item.selectedData.code !== tempContent.selectedData.code ||
              item.partyName !== tempContent.partyName
          );
          const mergedArray = [...newArr, tempContent];
          return mergedArray;
        });
      } else {
        setExcelContent((prevArray) => [...prevArray, tempContent]);
      }

      // * saving the data to localStorage
      if (!isEditing) storeNotDownload(tempContent);
      else {
        const datas = localStorage.getItem("PURCHASE_NOT_DOWNLOAD_DATA");
        const parsedData = JSON.parse(datas);
        const index = parsedData.findIndex(
          (obj) => obj.selectedData.code === tempContent.selectedData.code
        );
        parsedData[index] = tempContent;
        setIsEditing(false);
      }

      // * show the modal
      handleModal("Success ✅", "Content Added Successfully!", "Okay");
      window.purchase_modal_1.showModal();

      // setQrResult("...");

      // * clearing fields
      handleFormChange("itemName", null);
      handleFormChange("dynamicdisc", null);
      handleFormChange("quantity", null);
      handleFormChange("repetitionPrint", null);
      handleFormChange("mrp", null);
      handleFormChange("itemLocation", null);
      handleFormChange("unitPrice", "");
      handleFormChange("gstPercentage", null);
      handleFormChange("purchaseType", "DNM");
      handleFormChange("gstType", null);
      handleFormChange("mDiscPercentage", 0);
      handleFormChange("selectedData", null);
      setSelectedItem(null);

      if (formData?.gstType !== "Exempt")
        handleFormChange("gstPercentage", null);

      if (formData?.purchaseType !== "DM") handleFormChange("amount", null);
    };

    const askForConfirmation = (choice) => {
      if (choice === "NO") tempContent.repetition = 0;

      handleConfirmationModal(
        "Confirmation",
        "Are you sure you want to add this content?",
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
      totalBillAmount += item?.amount || 0;
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
          : content,
      },
    ];

    const barcodeCustomItemName = (item) => {
      const { itemName, partNo } = item;

      if (partNo) {
        return partNo?.split("-")?.[0] || partNo;
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
      const discCode = `${roundedDisc}${day}${month}${year}`;
      const itemName = barcodeCustomItemName(item);

      return Array(item.repetition).fill({
        itemName,
        discCode,
        location: item?.itemLocation || "N/A",
        coupon: "",
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
    let unitRate = parseFloat((MRP - MRP * (percentageValue / 100)).toFixed(2));

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

  useEffect(() => {
    handleFindValue();
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
    excelContent
      .map((item) => item?.amount)
      .reduce((acc, curr) => acc + (curr || 0), 0);

  const modifyExcelSheet = (action, code, partyName) => {
    const index = excelContent.findIndex(
      (item) => item.selectedData.code === code && item.partyName === partyName
    );
    if (action === "delete") {
      const confirmation = window.confirm(
        `Are you sure you want to delete ${excelContent?.[index]?.itemName}?`
      );

      if (confirmation) {
        const excelArray = excelContent.filter(
          (content) =>
            content.selectedData.code !== code ||
            content.partyName !== partyName
        );
        setExcelContent(excelArray);
        const datas = localStorage.getItem("PURCHASE_NOT_DOWNLOAD_DATA");
        const parsedData = JSON.parse(datas);
        const localArray = parsedData.filter(
          (content) =>
            content.selectedData.code !== code ||
            content.partyName !== partyName
        );
        setLocalStorage("PURCHASE_NOT_DOWNLOAD_DATA", localArray);
      }
    } else if (action === "edit") {
      setIsEditing(true);
      // remove the row from the excel sheet
      setExcelContent((prevArray) => {
        const newArray = prevArray.filter(
          (item) =>
            item.selectedData.editCode !== code && item.partyName !== partyName
        );
        return newArray;
      });

      // close the modal
      window.saleModal_4.close();

      console.log("Edit action triggered", excelContent?.[index]);
      const item = excelContent?.[index];

      // restore the fields
      setSelectedItem(item?.selectedData);
      const restoreFields = {
        partyName: item?.partyName,
        invoiceNo: item?.invoiceNo,
        invoiceDate: new Date(), // default date is today
        gstType: item.billSeries,
        unit: "Pcs", // default value
        purchaseType: item.purchaseType,
        itemName: item?.itemName,
        itemPartNoOrg: item?.itemPartNo,
        itemLocation: item?.itemLocation,
        quantity: item?.quantity,
        mrp: item?.mrp,
        gstPercentage: item?.gstPercentage,
        amount: item?.amount,
        finalDisc: "ERROR!",
        isIGST: item?.isIGST,
        dynamicdisc: item?.disc,
        mDiscPercentage: item?.mDiscPercentage,
        selectedData: item?.selectedData,
        repetitionPrint: parseInt(item?.repetitionPrint),
      };

      setFormData((prev) => ({ ...prev, ...restoreFields }));
    }
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

          {/* <form
            className="animate-pulse"
            onSubmit={(e) => {
              e.preventDefault();
              barCodeScanner();
            }}
          >
            <input
              value={barcodeScannedData || ""}
              onFocus={(e) => {
                e.target.value = "";
                setBarcodeScannedData("");
              }}
              type="text"
              placeholder="BARCODE SCAN 🔎"
              onChange={(e) => {
                setBarcodeScannedData(e.target.value);
              }}
              className="m-5 p-5 glass rounded-full w-[300px] text-center"
            />
          </form> */}
          {/* <p className="text-center m-5 glass rounded-sm">{qrResult}</p> */}

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

                if (formData?.gstType !== "Exempt") {
                  // * if gst type is exempt, then it will not modify the gst percentage
                  handleFormChange("gstPercentage", e?.gstPercentage || null);
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

                  handleFormChange("amount", unitPrice * e.target.value);
                } else if (formData?.unitPriceAfterDiscount_D6) {
                  if (formData?.gstType === "Exclusive") {
                    const exclusiveTotalAmount = exclusiveTaxTotalAmount(
                      formData.unitPriceAfterDiscount_D6,
                      e.target.value,
                      formData?.gstPercentage
                    );
                    handleFormChange("amount", exclusiveTotalAmount);
                  } else {
                    const inclExemptTotalAmount = inclusiveExemptTaxTotalAmount(
                      formData?.unitPriceAfterDiscount_D6,
                      e.target.value
                    );
                    handleFormChange("amount", inclExemptTotalAmount);
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

          {!loadingExcel && (
            <Select
              isDisabled={formData?.gstType === "Exempt"}
              placeholder="Select GST %"
              isSearchable={false}
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={gstAmount}
              getOptionLabel={(option) => `${option["value"]}`}
              value={
                SelectedItem?.gstPercentage && {
                  value: SelectedItem?.gstPercentage,
                }
              }
              onChange={(e) => {
                handleFormChange("gstPercentage", e.value);
              }}
            />
          )}
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

        {
          <p className="text-green-500">
            RECORDED DISC%:{" "}
            <span className="text-white font-bold">
              {formData?.dynamicdisc ?? "Not available"}
            </span>
          </p>
        }

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
                  <th>Item Part No</th>
                  <th>Item Part Organisation</th>
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
                      <td>{item?.billSeries}</td>
                      <td>{item?.unit}</td>
                      <td>{item?.purchaseType}</td>
                      <td>{item?.itemName}</td>
                      <td>{item?.itemPartNo}</td>
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
    </>
  );
}
