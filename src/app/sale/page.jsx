"use client";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Select, { createFilter } from "react-select";
import saletype from "../DB/Sale/saletype";
import seriesType from "../DB/Sale/seriestype";
import Image from "next/image";
import unitypes from "../DB/Purchase/unitypes";
import CustomOption from "../Dropdown/CustomOption";
import CustomMenuList from "../Dropdown/CustomMenuList";
import xlsx from "json-as-xlsx";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { SimpleIDB } from "@/utils/idb";
import saleInvoiceInvokePDF from "@/utils/saleInvoiceInvoke";

const GlobalIDB = new SimpleIDB("GLOBAL", "global");

export default function page() {
  // ****

  useEffect(() => {
    getAPIContent();
  }, []);

  const getNewBillRefNo = async () => {
    try {
      const response = await fetch("/api/bill-ref-no/new");
      const data = await response.json();
      if (data.newLabel) {
        // handleChange({
        //   target: {
        //     name: "seriesType",
        //     value: data.newLabel,
        //   },
        // });
        setBillSeriesRef(data.newLabel);
        return data.newLabel;
      }
      return null;
    } catch (error) {
      console.error("Error while fetching new bill ref no:", error);
      toast.error("Failed while getting new bill ref no.");
      return null;
    }
  };

  const [formData, setFormData] = useState({
    seriesType: null,
    saleDate: new Date(), // default today.
    saleType: null,
    partyName: null,
    vehicleNo: null,
    mobileNo: null,
    item: null,
    quantity: 1,
    unitType: null,
    mrp: null,
    disc: null,
    discAmount: null,
    gstAmount: null,
    totalAmount: null,
    selectedItemRow: -1,
    actualTotalAmount: null,
    bankPayment: null,
    cashPayment: null,
  });

  const [modalMessage, setModalMessage] = useState({
    message: null,
  });

  const [PartyAPIData, setPartyAPIData] = useState([]);
  const [ItemAPIData, setItemAPIData] = useState([]);
  const [APILoading, setAPILoading] = useState(true);
  const [SelectedItem, setSelectedItem] = useState(null);
  const [ExcelContent, setExcelContent] = useState([]);
  const [BillSeriesRef, setBillSeriesRef] = useState(null);
  // const [qrResult, setQrResult] = useState("...");

  // * Duplicate check

  const isDuplicate = (item) => {
    console.log(ExcelContent, item);
    const result = ExcelContent.find(
      (obj) =>
        obj?.itemName === item &&
        obj?.itemName !== null &&
        obj?.itemName !== undefined
    );
    if (result) {
      return true;
    }
    return false;
  };

  // * for uncommon useState alternative

  const handleChange = (event) => {
    // mostly used in input fields
    const name = event.target?.name;
    const value = event.target?.value;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleFormChange = (name, value) => {
    // used in direct value change
    if (!name) return;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleModalMessage = (message) => {
    const name = message?.name;
    const value = message?.value;
    setModalMessage((values) => ({ ...values, [name]: value }));
  };

  const isFormValidated = (form) => {
    for (let key in form) {
      // Skip the "gstAmount" check if "saleType" is "Exempt"
      // if (form.saleType === "Exempt" && key === "gstAmount") {
      //   continue;
      // }

      if (
        formData?.partyName !== "Cash" &&
        formData?.partyName !== "PHONE PE"
      ) {
        // mobile,vehicleNo, payment is only mandatory when partName is either Cash or Phone Pe
        if (key === "mobileNo" || key === "vehicleNo") continue;
        // if (key === "bankPayment" || key === "cashPayment") continue;
      }

      if (key === "bankPayment" || key === "cashPayment") continue;

      if (form[key] === null || form[key] === undefined || form[key] === "") {
        handleModalMessage({
          name: "message",
          value: `📜 The field "${key
            .replace(/[A-Z]/g, (match) => " " + match)
            .trim()
            .toUpperCase()}" is empty.`,
        });
        window.saleModal_1.showModal();
        return false;
      }
    }
    return true;
  };

  // Modify the excel sheet

  const modifyExcelSheet = (action, rowNo) => {
    if (action === "delete") {
      const confirmation = window.confirm(
        `Are you sure you want to delete ${ExcelContent?.[rowNo]?.itemName}?`
      );

      if (confirmation) {
        setExcelContent((prevArray) => {
          const newArray = prevArray.filter((item, index) => index !== rowNo);
          return newArray;
        });
      }
    } else if (action === "edit") {
      // remove the row from the excel sheet
      setExcelContent((prevArray) => {
        const newArray = prevArray.filter((item, index) => index !== rowNo);
        return newArray;
      });

      // close the modal
      window.saleModal_4.close();

      console.log("Edit action triggered", ExcelContent?.[rowNo]);
      const item = ExcelContent?.[rowNo];

      // restore the fields
      setSelectedItem(item?.SAVE_selectedItem);

      const restoreFields = {
        item: item?.itemName,
        quantity: item?.qty,
        unitType: item?.unit,
        mrp: item?.price,
        disc: item?.SAVE_discPercentage,
        discAmount: item?.SAVE_discAmount,
        gstAmount: item?.SAVE_gstAmount,
        totalAmount: item?.SAVE_totalAmount,
        actualTotalAmount: item?.SAVE_actualTotalAmount,
      };

      setFormData((prev) => ({ ...prev, ...restoreFields }));
    }
  };

  // API CALLS

  const getAPIContent = async () => {
    try {
      setAPILoading(true);

      // check in IDB
      const storedItemData = await GlobalIDB.get("ITEMS_DATA");
      const storedPartyData = await GlobalIDB.get("PARTIES_DATA");

      if (storedItemData) setItemAPIData(JSON.parse(storedItemData));
      if (storedPartyData) setPartyAPIData(JSON.parse(storedPartyData));

      // calls apis simultaneously

      const responses = await Promise.all([
        fetch("/api/items"),
        fetch(
          "https://script.google.com/macros/s/AKfycbwr8ndVgq8gTbhOCRZChJT8xEOZZCOrjev29Uk6DCDLQksysu80oTb8VSnoZMsCQa3g/exec"
        ),
      ]);

      const data = await Promise.all(
        responses.map((response) => response.json())
      );

      const [itemData, partyData] = data;

      if (itemData?.length > 0 && partyData?.length > 0) {
        setItemAPIData(itemData);
        setPartyAPIData(partyData);

        // set the values for offline or error use
        await GlobalIDB.set("ITEMS_DATA", JSON.stringify(itemData));
        await GlobalIDB.set("PARTIES_DATA", JSON.stringify(partyData));
      } else {
        toast.error("No item or party data found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed while getting item & party data.");
    } finally {
      setAPILoading(false);
    }
  };

  const calculateDisc = (disc) => {
    if (!disc || !formData?.mrp) return;

    const mrp = formData?.mrp;

    const discAmount = (mrp * disc) / 100;

    handleChange({
      target: {
        name: "discAmount",
        value: Number(discAmount.toFixed(2)),
      },
    });
    handleFormChange("actualTotalAmount", mrp - discAmount);
    handleChange({
      target: {
        name: "totalAmount",
        value: (mrp - discAmount) * formData?.quantity,
      },
    });
  };

  const adjustDisc = (discAmount) => {
    // console.log("Discount Amount is triggered", discAmount);

    if (!formData?.mrp) return;

    const disc = (discAmount / formData?.mrp) * 100;

    handleChange({
      target: {
        name: "disc",
        value: Number(disc.toFixed(2)),
      },
    });

    handleFormChange("actualTotalAmount", formData?.mrp - discAmount);

    handleChange({
      target: {
        name: "totalAmount",
        value: (formData?.mrp - discAmount) * formData?.quantity,
      },
    });
  };

  const getTotalBillAmount = () =>
    ExcelContent.map((item) => item?.amount).reduce(
      (acc, curr) => acc + (curr || 0),
      0
    );

  function addDaysToDate(dateStr, daysToAdd) {
    // Split the date string into parts
    const [day, month, year] = dateStr.split("/").map(Number);

    // Create a Date object from the input date
    const date = new Date(year, month - 1, day);

    // Add the specified number of days
    date.setDate(date.getDate() + daysToAdd);

    // Format the new date back to DD/MM/YYYY format
    const futureDay = String(date.getDate()).padStart(2, "0");
    const futureMonth = String(date.getMonth() + 1).padStart(2, "0");
    const futureYear = date.getFullYear();

    return `${futureDay}/${futureMonth}/${futureYear}`;
  }

  const downloadSheet = () => {
    if (ExcelContent.length === 0) {
      handleModalMessage({
        name: "message",
        value: `⚠ Add one document before exporting excel`,
      });
      window.saleModal_1.showModal();
      return;
    }

    if (formData?.partyName === "PHONE PE") {
      if (!formData?.cashPayment && !formData?.bankPayment) {
        handleModalMessage({
          name: "message",
          value: `⚠ Add the payment amount before exporting excel`,
        });
        window.saleModal_1.showModal();
        return;
      }

      if (formData?.partyName === "Cash" && formData?.bankPayment > 0) {
        // Change the partyname to PHONE PE
        handleFormChange("partyName", "PHONE PE");
        ExcelContent.forEach((item) => {
          item.partyName = "PHONE PE";
        });
      }
    }

    let content = [];

    ExcelContent.forEach((d) => {
      content.push(d);
    });

    // Add mobile to first field

    content[0].mobileNo = ExcelContent[0].one_field_mobile;
    content[0].settlement_amount_1_cashPayment = formData?.cashPayment; // settlement amount 1
    content[0].settlement_amount_2_bankPayment = formData?.bankPayment; // settlement amount 2
    const REMOTE_BILL_REF_NO = content[0].REMOTE_BILL_REF_NO; // the dynamic bill ref no eg. APP/16/2425
    content[0].VCH_BILL_NO =
      REMOTE_BILL_REF_NO.split("/")[1] + "/" + REMOTE_BILL_REF_NO.split("/")[2];
    const totalBillAmount = getTotalBillAmount();

    if (formData?.bankPayment > 0) {
      content[0].SETTLEMENT_NARR2 = "Bank";
    }

    // check if we need to generate the columns T, U and V (Bill Ref No, bill ref Amount,bill ref  Due Date)
    //Below fields will get updated when Series is APP, Party Name is other than Cash and Amount – (SETTLEMENT_AMT1 + SETTLEMENT_AMT2) > 0. If the value is zero then these fields will be blank.

    console.log(
      "Total Bill Amount, Cash Payment, Bank Payment, Party Name",
      totalBillAmount,
      content[0].settlement_amount_1_cashPayment,
      content[0].settlement_amount_2_bankPayment,
      content[0].partyName
    );

    if (
      content[0].vchSeries === "APP" &&
      content[0].partyName !== "Cash" &&
      // formData?.partyName !== "PHONE PE" &&
      totalBillAmount -
        (Number(content[0].settlement_amount_1_cashPayment || 0) +
          Number(content[0].settlement_amount_2_bankPayment || 0)) >
        0
    ) {
      console.log("Bill Ref No, bill ref Amount,bill ref  Due Date");
      content[0].BILL_REF_NO = REMOTE_BILL_REF_NO;
      content[0].BILL_REF_AMOUNT = totalBillAmount;
      content[0].BILL_REF_DUE_DATE = addDaysToDate(content[0].billDate, 5);
    }

    console.log("XLSX Content", content);

    let data = [
      {
        sheet: "Sheet1",
        columns: [
          { label: "vch_series", value: "vchSeries" },
          { label: "bill date", value: "billDate" },
          { label: "sale type", value: "saleType" },
          { label: "party name", value: "partyName" },
          { label: "narration", value: "narration" },
          { label: "item name", value: "itemName" },
          { label: "qty", value: "qty", format: "0.00" },
          { label: "unit", value: "unit" },
          { label: "price", value: "price", format: "0.00" },
          { label: "disc", value: "disc", format: "0.00" },
          { label: "Amount", value: "amount", format: "0.00" },
        ],
        content,
      },
    ];

    if (formData?.saleType === "IGST")
      data[0].columns.push({
        label: "igst percent",
        value: "igstPercent",
        format: "0",
      });
    else
      data[0].columns.push(
        {
          label: "CGST",
          value: "cgst",
          format: "0",
        },
        {
          label: "SGST",
          value: "sgst",
          format: "0",
        }
      );

    data[0].columns.push(
      {
        label: "BILLED_PARTY_MOBILE_NO",
        value: "mobileNo",
        format: "0",
      },
      {
        label: "BILLED_PARTY_NAME",
        value: "narration",
      },
      {
        label: "SETTLEMENT_AMT1",
        value: "settlement_amount_1_cashPayment",
      },
      {
        label: "SETTLEMENT_AMT2",
        value: "settlement_amount_2_bankPayment",
      },
      {
        label: "SETTLEMENT_NARR2",
        value: "SETTLEMENT_NARR2",
      },
      {
        label: "VEHICLE_NO",
        value: "narration",
      },
      {
        label: "BILL_REF_NO",
        value: "BILL_REF_NO",
      },
      {
        label: "BILL_REF_AMOUNT",
        value: "BILL_REF_AMOUNT",
      },
      {
        label: "BILL_REF_DUE_DATE",
        value: "BILL_REF_DUE_DATE",
      },
      {
        label: "VCH/BILL_NO",
        value: "VCH_BILL_NO", // eg. 1/2526 , 2/2526
      }
    );

    exportExcel(data);
  };

  const exportExcel = (data) => {
    const settings = {
      fileName: `${
        formData?.vehicleNo?.toUpperCase() || formData?.partyName
      }_${new Date().getTime()}`,
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    const callback = () => {
      handleModalMessage({
        name: "message",
        value: `✅ Exporting excel successful`,
      });
      window.saleModal_1.showModal();
      localStorage.removeItem("SALE_TEMP_CONTENT");

      sendPurchaseHistory(data);
    };

    xlsx(data, settings, callback);
  };

  const getVchSeries = (saleType, series) => {
    if (saleType === "Exempt") {
      //  return APP when sale type is Exempt
      return "APP";
    }
    return series;
  };

  const addContent = async () => {
    // if (!isFormValidated(formData)) return;

    let remoteLabel = BillSeriesRef;

    if (remoteLabel === null) {
      const loading = toast.loading("Getting the bill ref no...");
      remoteLabel = await getNewBillRefNo();
      console.log("Remote Label", remoteLabel);
      toast.dismiss(loading);
      if (remoteLabel === null) {
        handleModalMessage({
          name: "message",
          value: `❌ Failed to get the bill ref no`,
        });
        window.saleModal_1.showModal();
        return;
      }
    }

    const convertToDateString = (date) => {
      var dateString = `${date}`;
      var date = new Date(dateString);
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      var formattedDate =
        (day < 10 ? "0" + day : day) +
        "/" +
        (month < 10 ? "0" + month : month) +
        "/" +
        year;

      return formattedDate;
    };
    //   Formula to return the disc percent in Excel
    const discPercent = () => {
      if (formData?.saleType === "IGST") {
        const igstPer = parseFloat(formData?.gstAmount);
        const discPer = parseFloat(formData?.disc);
        const deno = igstPer / 100;
        const num = discPer + igstPer;
        const result = num / (deno + 1);
        return result;
      } else {
        return formData?.disc;
      }
    };

    const tempContent = {
      vchSeries: getVchSeries(formData?.saleType, formData?.seriesType),
      billDate: convertToDateString(formData?.saleDate),
      saleType: formData?.saleType,
      partyName: formData?.partyName,
      narration: formData?.vehicleNo?.toUpperCase(),
      itemName: formData?.item,
      qty: formData?.quantity,
      unit: formData?.unitType,
      price: formData?.mrp,
      disc: discPercent(),
      amount: Math.round(formData?.totalAmount),
      igstPercent: formData?.gstAmount,
      cgst: formData?.gstAmount / 2,
      sgst: formData?.gstAmount / 2,
      one_field_mobile: formData?.mobileNo, // This will be only affect one row
      // settlement_amount_2_bankPayment: formData?.bankPayment,
      // settlement_amount_1_cashPayment: formData?.cashPayment,
      SAVE_discPercentage: formData?.disc,
      SAVE_gstAmount: formData?.gstAmount,
      SAVE_totalAmount: formData?.totalAmount,
      SAVE_discAmount: formData?.discAmount,
      SAVE_selectedItem: SelectedItem,
      SAVE_actualTotalAmount: formData?.actualTotalAmount,
      REMOTE_BILL_REF_NO: remoteLabel,
    };

    console.log("Bill remote ref", remoteLabel, tempContent);

    setExcelContent((prevArray) => [...prevArray, tempContent]);

    // * Save the temp content to local storage for backup
    localStorageBackup(tempContent);

    handleModalMessage({
      name: "message",
      value: `✅ Item added successfully`,
    });
    window.saleModal_1.showModal();

    // clear the field

    // seriesType: null,
    // saleDate: new Date(), // default today.
    // saleType: null,
    // partyName: null,
    // vehicleNo: null,
    // mobileNo: null,
    // item: null,
    // quantity: 1,
    // unitType: null,
    // mrp: null,
    // disc: null,
    // discAmount: null,
    // gstAmount: null,
    // totalAmount: null,
    // selectedItemRow: -1,
    // actualTotalAmount: null,
    const clearFieldsList = [
      "disc",
      "mrp",
      "item",
      "unitType",
      "discAmount",
      "gstAmount",
      "totalAmount",
      "actualTotalAmount",
      "quantity",
    ];

    clearFieldsList.forEach((key) => {
      handleFormChange(key, null);
    });

    // clear the selected item
    setSelectedItem(null);
  };

  const fullFieldReset = () => {
    setFormData({
      seriesType: null,
      saleDate: new Date(), // default today.
      saleType: null,
      partyName: null,
      vehicleNo: null,
      mobileNo: null,
      item: null,
      quantity: 1,
      unitType: null,
      mrp: null,
      disc: null,
      discAmount: null,
      gstAmount: null,
      totalAmount: null,
      selectedItemRow: -1,
      actualTotalAmount: null,
      bankPayment: null,
      cashPayment: null,
    });
    setBillSeriesRef(null);
    setExcelContent([]);
    localStorage.removeItem("SALE_TEMP_CONTENT");
  };

  const sendPurchaseHistory = (sheet) => {
    handleModalMessage({
      name: "message",
      value: `⏳ Uploading document to history....`,
    });
    window.saleModal_1.showModal();

    // calculate the total amount

    let totalAmount = 0;

    sheet[0].content.forEach((element) => {
      totalAmount += element?.amount;
    });

    const payload = {
      sheetdata: JSON.stringify(sheet),
      items: sheet[0]?.content?.length,
      vehicle: formData?.vehicleNo || formData?.partyName,
      desc: "sale",
      totalAmount: totalAmount,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    fetch("/api/sales", options)
      .then((response) => {
        if (response.status === 200) {
          fullFieldReset();

          handleModalMessage({
            name: "message",
            value: `✅ Successfully uploaded`,
          });
          window.saleModal_1.showModal();
        } else {
          handleModalMessage({
            name: "message",
            value: `❌ Uploading failed`,
          });
          window.saleModal_1.showModal();
        }
      })
      .catch((err) => {
        handleModalMessage({
          name: "message",
          value: `❌ Server error, reupload or contact developer`,
        });
        window.saleModal_1.showModal();
      });
  };

  const localStorageBackup = (tempContent) => {
    const checkLocal = localStorage.getItem("SALE_TEMP_CONTENT");
    let localContent = [];
    if (checkLocal !== null && checkLocal !== undefined) {
      localContent = JSON.parse(checkLocal || "[]");
      localContent.push(tempContent);
    } else {
      localContent.push(tempContent);
    }

    localStorage.setItem("SALE_TEMP_CONTENT", JSON.stringify(localContent));
  };

  useEffect(() => {
    if (localStorage.getItem("SALE_TEMP_CONTENT") === null) return;
    // const localContent = JSON.parse(
    //   localStorage.getItem("SALE_TEMP_CONTENT") || "[]"
    // );
    window.saleModal_3.showModal();
  }, []);

  const userRestoreConfirmation = (accepted) => {
    if (accepted) {
      const localContent = JSON.parse(
        localStorage.getItem("SALE_TEMP_CONTENT") || "[]"
      );

      console.log("Local Content", localContent);

      setExcelContent(localContent);
      setBillSeriesRef(localContent[0]?.REMOTE_BILL_REF_NO);
      handleChange({
        target: {
          name: "vehicleNo",
          value: localContent[0]?.narration,
        },
      });

      handleFormChange("partyName", localContent[0]?.partyName);

      handleChange({
        target: {
          name: "seriesType",
          value: localContent[0]?.vchSeries,
        },
      });
      handleChange({
        target: {
          name: "saleType",
          value: localContent[0]?.saleType,
        },
      });

      handleFormChange("mobileNo", localContent[0]?.one_field_mobile);

      // handleChange({
      //   target: {
      //     name: "saleDate",
      //     value: localContent[0]?.billDate,
      //   },
      // });
    } else {
      localStorage.removeItem("SALE_TEMP_CONTENT");
    }
  };

  // const handleInputSettlement = (type, amount) => {
  //   const totalBillAmount = getTotalBillAmount();

  //   if (amount > totalBillAmount) {
  //     amount = totalBillAmount; // Ensure amount doesn't exceed the total bill
  //   }

  //   if (type === "online") {
  //     const cashPayment = totalBillAmount - amount;
  //     handleFormChange("cashPayment", Math.max(0, cashPayment)); // Ensure non-negative value
  //   } else if (type === "cash") {
  //     const bankPayment = totalBillAmount - amount;
  //     handleFormChange("bankPayment", Math.max(0, bankPayment)); // Ensure non-negative value
  //   }
  // };

  // ****
  return (
    <>
      {/* Alert */}

      <Toaster />

      {/* General dialog */}

      <dialog id="saleModal_1" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Message!</h3>
          <p className="py-4">{modalMessage?.message}</p>
          <div className="modal-action">
            <button className="btn">Close</button>
          </div>
        </form>
      </dialog>

      {/* Confirmation dialog */}

      <dialog id="saleModal_2" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">{modalMessage?.message}</h3>
          <p className="py-4 text-warning">Press "OK" to add the item.</p>
          <div className="text-white">
            <b className="block mb-2 text-warning">Summary: </b>
            <p>Item: {formData?.item}</p>
            <p>MRP: {formData?.mrp}</p>
            <p>QTY: {formData?.quantity}</p>
            <p>Total Amount: {Math.round(formData?.totalAmount)}</p>
          </div>
          <div className="modal-action">
            <button className="btn btn-success">Edit</button>
            <button onClick={addContent} className="btn btn-error">
              Ok
            </button>
          </div>
        </form>
      </dialog>

      {/* Backup confirmation modal */}

      <dialog id="saleModal_3" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">⚠️ Alert</h3>
          <p className="py-4">
            System found some unsaved data, if you want to restore, click on
            "Accept" otherwise "deny" it to delete.
          </p>
          <div className="modal-action">
            <button
              onClick={() => userRestoreConfirmation(false)}
              className="btn bg-red-600"
            >
              Deny
            </button>
            <button
              onClick={() => userRestoreConfirmation(true)}
              className="btn bg-green-600"
            >
              Accept
            </button>
          </div>
        </form>
      </dialog>

      {/* Preview entries */}

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
                  <th>Qty</th>
                  <th>MRP</th>
                  <th>Disc%</th>
                  <th>Tot. Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}

                {ExcelContent.map((item, index) => {
                  // console.log("Item", item);
                  return (
                    <tr key={index} className="hover:bg-indigo-950">
                      <th>{index + 1}</th>
                      <td>{item?.itemName}</td>
                      <td>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => modifyExcelSheet("edit", index)}
                            className="btn btn-sm btn-warning"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => modifyExcelSheet("delete", index)}
                            className="btn btn-sm btn-error"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td>{item?.qty}</td>
                      <td>{item?.price}</td>
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
                    handleChange(e);
                    // const value = Math.max(0, e.target.value); // Ensure non-negative value
                    // handleInputSettlement("cash", value);
                  }}
                />
                <input
                  name="bankPayment"
                  value={formData?.bankPayment || ""}
                  onChange={(e) => {
                    handleChange(e);
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
            <button onClick={downloadSheet} className="btn bg-green-600">
              Download
            </button>
          </div>
        </form>
      </dialog>

      {/* Alert  */}

      <p className="glass text-center text-[40px] font-mono mb-9 m-auto rounded-xl w-[98%] text-white">
        SALE
      </p>
      <div className="text-center">
        <button
          className={`p-2 rounded-md ${
            BillSeriesRef ? "bg-green-500" : "bg-red-500 animate-pulse"
          }`}
        >
          {BillSeriesRef
            ? `Bill Series: ${BillSeriesRef}`
            : "Add one item to get the bill ref no."}
        </button>
      </div>
      <div className="text-center">
        {APILoading && (
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        )}
      </div>
      <Select
        placeholder="SERIES TYPE"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={seriesType}
        getOptionLabel={(option) => `${option["value"]}`}
        isSearchable={false}
        value={formData?.seriesType && { value: formData.seriesType }}
        onChange={(e) => {
          handleChange({ target: { name: "seriesType", value: e?.value } });
          if (e?.value === "MAIN") {
            handleChange({ target: { name: "saleType", value: "Exempt" } });
            handleChange({ target: { name: "gstAmount", value: "0" } });
          } else if (e?.value === "GST") {
            handleChange({ target: { name: "gstAmount", value: null } });
            handleChange({ target: { name: "saleType", value: "GST INCL" } });
          }
        }}
        isDisabled={ExcelContent?.length > 0}
      />
      <div className="flex justify-center items-center flex-wrap">
        <DatePicker
          className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
          placeholderText="SALE DATE"
          showPopperArrow={true}
          disabled={ExcelContent?.length > 0}
          maxDate={new Date()}
          selected={formData?.saleDate ?? new Date()}
          onChange={(selectedDate) => {
            handleChange({
              target: {
                name: "saleDate",
                value: selectedDate,
              },
            });
          }}
        />
      </div>
      <div>
        <Select
          placeholder="SALE TYPE"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          options={saletype}
          getOptionLabel={(option) => `${option["value"]}`}
          isSearchable={false}
          value={formData?.saleType && { value: formData.saleType }}
          onChange={(e) => {
            handleChange({ target: { name: "saleType", value: e?.value } });
          }}
          isDisabled={formData?.seriesType === "MAIN"}
          filterOption={
            formData?.seriesType === "GST"
              ? (option) => option?.value !== "Exempt"
              : null
          }
        />
      </div>
      <Select
        placeholder="PARTY NAME"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={PartyAPIData}
        getOptionLabel={(option) => `${option["value"]}`}
        value={formData?.partyName && { value: formData?.partyName }}
        onChange={(e) => {
          handleChange({ target: { name: "partyName", value: e?.value } });
        }}
        filterOption={createFilter({ ignoreAccents: false })}
        components={{ Option: CustomOption, MenuList: CustomMenuList }}
      />

      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5 uppercase"
          placeholder="VEHICLE NO"
          type="text"
          name="vehicleNo"
          onChange={handleChange}
          value={formData?.vehicleNo || ""}
          onWheel={(e) => {
            e.target.blur();
          }}
          disabled={ExcelContent?.length > 0}
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5 uppercase"
          placeholder="MOBILE NO"
          type="number"
          name="mobileNo"
          onChange={handleChange}
          value={formData?.mobileNo || ""}
          onWheel={(e) => {
            e.target.blur();
          }}
          disabled={ExcelContent?.length > 0}
        />
      </div>

      {/* Item Section */}
      <Select
        filterOption={createFilter({ ignoreAccents: false })}
        components={{ Option: CustomOption, MenuList: CustomMenuList }}
        placeholder="SELECT ITEM"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={ItemAPIData}
        isClearable={true}
        getOptionLabel={(option) =>
          `${option["itemName"]} ${option["partNumber"]}`
        }
        formatOptionLabel={({ itemName }) => (
          <div className="flex justify-between">
            <p className="text-black">{itemName}</p>
          </div>
        )}
        value={SelectedItem}
        noOptionsMessage={() => {
          return <p>Add the item in BUSY, then refresh.</p>;
        }}
        onChange={(e) => {
          console.log("Selected item value: ", e);

          if (!formData?.seriesType) {
            toast.error("Select series type first");
            return;
          }

          // new
          setSelectedItem(e);
          handleFormChange("item", e?.itemName);
          handleFormChange("unitType", e?.unitName);
          handleFormChange("quantity", 1);

          if (e?.unitPrice) {
            handleFormChange("mrp", e?.unitPrice);
          } else if (e?.mrp) {
            handleFormChange("mrp", e?.mrp);
          }

          if (formData?.seriesType === "GST") {
            if (e?.gstPercentage)
              handleFormChange("gstAmount", e?.gstPercentage?.replace("%", ""));
          }

          if (formData?.saleType === "Exempt") {
            handleChange({ target: { name: "gstAmount", value: "0" } });
          }
        }}
      />
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="QUANTITY"
          type="number"
          name="quantity"
          value={formData?.quantity || ""}
          onChange={(e) => {
            // console.log("Actual value", formData?.actualTotalAmount);

            handleChange(e);
            if (e.target.value) {
              handleFormChange(
                "totalAmount",
                formData?.actualTotalAmount * e.target.value
              );
            } else {
              handleFormChange("totalAmount", formData?.actualTotalAmount);
            }
          }}
          onWheel={(e) => {
            e.target.blur();
          }}
        />
      </div>
      <Select
        placeholder="SELECT UNIT"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={unitypes}
        getOptionLabel={(option) => `${option["value"]}`}
        value={formData?.unitType && { value: formData?.unitType }}
        onChange={(e) => {
          handleChange({ target: { name: "unitType", value: e?.value } });
        }}
        isSearchable={false}
      />
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="MRP"
          type="number"
          onChange={(e) => {
            handleChange(e);
            calculateDisc();
          }}
          value={formData?.mrp || ""}
          name="mrp"
          onWheel={(e) => {
            e.target.blur();
          }}
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="DISC %"
          type="number"
          onChange={(e) => {
            handleChange(e);
            calculateDisc(e.target.value);
          }}
          value={formData?.disc || ""}
          name="disc"
          onWheel={(e) => {
            e.target.blur();
          }}
        />
      </div>
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="DISC AMOUNT"
          type="number"
          onChange={(e) => {
            handleChange(e);
            adjustDisc(e.target.value);
          }}
          value={formData?.discAmount || ""}
          name="discAmount"
          onWheel={(e) => {
            e.target.blur();
          }}
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="GST %"
          type="number"
          onChange={handleChange}
          value={formData?.gstAmount || ""}
          name="gstAmount"
          onWheel={(e) => {
            e.target.blur();
          }}
          disabled={formData?.seriesType === "MAIN"}
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="TOTAL AMOUNT"
          type="number"
          onChange={handleChange}
          value={formData?.totalAmount || ""}
          name="totalAmount"
          onWheel={(e) => {
            e.target.blur();
          }}
        />
      </div>

      <div className="py-20"></div>

      {/* Bottom Nav Bar */}

      <div className="btm-nav glass bg-blue-800">
        <button
          onClick={() => {
            if (isFormValidated(formData)) {
              if (isDuplicate(formData?.item)) {
                handleModalMessage({
                  name: "message",
                  value: `❌ Duplicate Item`,
                });
                window.saleModal_2.showModal();
                return;
              }
              handleModalMessage({
                name: "message",
                value: `⚠ Confirmation`,
              });
              window.saleModal_2.showModal();
            }
          }}
          className="text-white hover:bg-blue-900"
        >
          <Image
            className="mb-20"
            src="/assets/images/add-button.png"
            width={60}
            height={60}
            alt="icon"
          />
        </button>

        <button
          onClick={() => {
            if (ExcelContent?.length === 0) {
              toast.error("No item has been added");
              return;
            }

            window.saleModal_4.showModal();
          }}
          className=" text-white hover:bg-blue-900"
        >
          <Image
            src="/assets/images/download (1).png"
            width={40}
            height={40}
            alt="icon"
          />
          <span className="mb-6 text-sm font-mono">Preview</span>
        </button>

        <button
          onClick={async () => {
            if (ExcelContent?.length === 0) {
              toast.error("No item has been added");
              return;
            }
            await saleInvoiceInvokePDF(ExcelContent);
          }}
          className=" text-white hover:bg-blue-900"
        >
          <Image
            src="/assets/images/printer.png"
            width={40}
            height={40}
            alt="icon"
          />
          <span className="mb-6 text-sm font-mono">Invoice</span>
        </button>
        
        <button
          onClick={() => {
            if (!APILoading) {
              getAPIContent();
            }
          }}
          className="text-white hover:bg-blue-900"
        >
          <Image
            src="/assets/images/refresh-arrow.png"
            width={40}
            height={40}
            alt="icon"
          />
          <span className="mb-6 text-sm font-mono">Refresh</span>
        </button>
        <button
          onClick={() => {
            const confirmation = window.confirm(
              `Are you sure you want to reset?`
            );

            if (confirmation) {
              fullFieldReset();
            }
          }}
          className="text-white hover:bg-blue-900"
        >
          <Image
            src="/assets/images/remove.png"
            width={40}
            height={40}
            alt="icon"
          />
          <span className="mb-6 text-sm font-mono">Reset</span>
        </button>
      </div>
    </>
  );
}
