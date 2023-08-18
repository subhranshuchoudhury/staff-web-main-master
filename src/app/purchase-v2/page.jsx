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
} from "../Disc/disc";
import Image from "next/image";
import CustomOption from "../Dropdown/CustomOption";
import CustomMenuList from "../Dropdown/CustomMenuList";
import { useRouter } from "next/navigation";
import purchasetype from "../DB/Purchase/purchasetype";

export default function page() {
  // * Use Effects

  useEffect(() => {
    getExcelData();
  }, []);

  // * useStates for storing data.

  const [loadingExcel, setLoadingExcel] = useState(false); // * false for dev purpose
  const [excelContent, setExcelContent] = useState([]);
  const [partyData, setPartyData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [formData, setFormData] = useState({
    partyName: null,
    invoiceNo: null,
    invoiceDate: new Date(), // default date is today
    gstType: null,
    unit: "Pcs", // default value
    purchaseType: "DNM",
    mDiscPercentage: 0, // mention discount percentage
    itemPartNo: null,
    itemLocation: null, // from item data
    quantity: null,
    mrp: null,
    gstPercentage: null,
    amount: null,
  });
  const [modalMessage, setModalMessage] = useState({
    title: "",
    message: "",
    button: "",
  });

  // * handle the modal

  const handleModal = (title, message, button) => {
    setModalMessage({ title, message, button });
  };

  // * handle the changes of formData

  const handleFormChange = (event) => {
    console.log(event.target?.name, event.target?.value);
    const name = event.target?.name;
    const value = event.target?.value;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  // * router for navigation

  const router = useRouter();

  // * Load our excel document for Party & Item Data.

  const getExcelData = async () => {
    // * Check if data is already saved in localStorage

    checkLocalStorageSaved("PARTY_API_DATA", setPartyData);
    checkLocalStorageSaved("ITEM_API_DATA", setItemData);

    // Promise.all([
    //   fetch(
    //     "https://script.google.com/macros/s/AKfycbx3G0up1xJoNIJqXLRdmSLQ09OPtwKnTfi8uWPzEw-vCUT4nwvluEmwOA3CKinO6PJhPg/exec"
    //   ),
    //   fetch(
    //     "https://script.google.com/macros/s/AKfycbwr8ndVgq8gTbhOCRZChJT8xEOZZCOrjev29Uk6DCDLQksysu80oTb8VSnoZMsCQa3g/exec"
    //   ),
    // ])
    //   .then((responses) =>
    //     Promise.all(responses.map((response) => response.json()))
    //   )
    //   .then((data) => {
    //     // data[0] contains the items
    //     // data[1] contains the party

    //     const item_data = data[0];
    //     const party_data = data[1];

    //     // localStorage.setItem("")

    //     setItemData(item_data);
    //     setPartyData(party_data);

    //     setLoadingExcel(false);

    //     localStorage.setItem("PARTY_API_DATA", JSON.stringify(party_data));
    //     localStorage.setItem("ITEM_API_DATA", JSON.stringify(item_data));
    //   })
    //   .catch((error) => {
    //     setLoadingExcel(true);
    //     console.error(error);
    //   });
  };

  // * localStorage for storing data
  const checkLocalStorageSaved = (address, manager) => {
    let storage = localStorage.getItem(address); // * address is the key
    if (storage !== null && storage != undefined) {
      storage = JSON.parse(storage);
      manager(storage); // * manager is the setter function
    }
  };

  // * form validation

  const isFormValidated = (form) => {
    for (let key in form) {
      if (form[key] === null || form[key] === undefined || form[key] === "") {
        handleModal(
          "Error",
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
    if (!isFormValidated(formData)) return;

    // * Converting the new Date() to dd-mm-yyyy format

    const dateToFormattedString = (date) => {
      var dateString = `${date}`;
      var date = new Date(dateString);
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      var formattedDate =
        (day < 10 ? "0" + day : day) +
        "-" +
        (month < 10 ? "0" + month : month) +
        "-" +
        year;

      return formattedDate;
    };

    // * mutable values

    let gstValue = parseInt(formData?.gstPercentage?.split("%")[0]?.trim());
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

    if (formData?.purchaseType === "DM" && formData?.gstType === "Exclusive") {
      disc = exclusiveDM(
        formData?.mrp,
        formData?.quantity,
        formData?.mDiscPercentage,
        gstValue
      );
    } else if (formData?.purchaseType === "DM") {
      disc = formData?.mDiscPercentage;
    }

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
      purchaseType: purchaseType,
      partyName: formData?.partyName,
      eligibility: eligibility,
      invoiceNo: formData?.invoiceNo,
      itemName: formData?.itemPartNo,
      quantity: formData?.quantity,
      unit: formData?.unit,
      mrp: formData?.mrp,
      disc: disc,
      amount: amountField,
      cgst: cgst,
      sgst: cgst,
    };

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

    setExcelContent((prevArray) => [...prevArray, tempContent]);
  };

  // * create Excel file

  const createSheet = () => {
    if (excelContent.length === 0) {
      alert("Empty Content!");
      return;
    }
    // empty variable to restore.

    let content = [];
    let BILL_REF_AMOUNT = 0;

    // do not touch this.
    excelContent.forEach((e) => {
      content.push(e);
      BILL_REF_AMOUNT += e?.amount;
    });
    content[0].BILL_REF_AMOUNT = Math.round(BILL_REF_AMOUNT);

    let data = [
      {
        sheet: "Sheet1",
        columns: [
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
        ],
        content,
      },
    ];

    DownloadExcel(content[0]?.partyName, content[0]?.invoiceNo, data);
  };

  // * download the excel file

  const DownloadExcel = (fileName, invoice, data) => {
    const settings = {
      fileName: `${fileName}-${invoice?.split("-")[1] || invoice}`,
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };
    let callback = function () {
      console.log("File Downloaded..");
      //   sendPurchaseHistory(fileName, invoice, data);
    };
    xlsx(data, settings, callback);
  };

  return (
    <>
      {/* <button className="btn" onClick={() => window.my_modal_1.showModal()}>
        open modal
      </button> */}
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
      <h1 className="text-center">V2</h1>
      <div className="text-center m-auto">
        {loadingExcel && (
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        )}

        <div className="m-5 flex justify-between flex-col">
          {partyData?.length > 0 && (
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
              placeholder="PARTY NAME"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              getOptionLabel={(option) => `${option["value"]}`}
              options={partyData}
              value={formData?.partyName && { value: formData.partyName }}
              onChange={(e) => {
                console.log("PARTY NAME SELECT: ", e);
                handleFormChange({
                  target: { name: "partyName", value: e.value },
                });
                handleFormChange({
                  target: {
                    name: "creditDays",
                    value:
                      isNaN(e?.creditDays) || e?.creditDays === ""
                        ? 0
                        : e?.creditDays,
                  },
                });
              }}
              noOptionsMessage={() => {
                return (
                  <p
                    onClick={() => router.push("/party")}
                    className="hover:cursor-pointer"
                  >
                    ➕ Add Party
                  </p>
                );
              }}
            />
          )}

          <div className="flex justify-center items-center flex-wrap">
            {!loadingExcel && (
              <input
                placeholder="Invoice No"
                className="input input-bordered input-secondary m-5 uppercase w-[295px]"
                type="text"
                value={formData?.invoiceNo || ""}
                onChange={(e) => {
                  handleFormChange({
                    target: {
                      name: "invoiceNo",
                      value: e.target.value?.toUpperCase(),
                    },
                  });
                }}
              />
            )}

            <DatePicker
              className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
              placeholderText="INVOICE DATE"
              showPopperArrow={true}
              maxDate={new Date()}
              todayButton="Today"
              dateFormat="dd/MM/yyyy"
              selected={formData?.invoiceDate ?? new Date()}
              onChange={(selectedDate) => {
                handleFormChange({
                  target: {
                    name: "invoiceDate",
                    value: selectedDate,
                  },
                });
              }}
            />
          </div>

          {!loadingExcel && (
            <Select
              placeholder="GST Type"
              isSearchable={false}
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={gstType}
              getOptionLabel={(option) => `${option["value"]}`}
              value={formData?.gstType && { value: formData.gstType }}
              onChange={(e) => {
                handleFormChange({
                  target: { name: "gstType", value: e.value },
                });
              }}
            />
          )}
          {!loadingExcel && (
            <div>
              <Select
                placeholder="PURCHASE TYPE"
                className="w-full m-auto p-5 text-blue-800 font-bold"
                isSearchable={false}
                options={purchasetype}
                onChange={(e) => {
                  handleFormChange({
                    target: { name: "purchaseType", value: e.value },
                  });
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
              <input
                hidden={formData?.purchaseType === "DNM"}
                value={formData?.mDiscPercentage || ""}
                onChange={(e) => {
                  handleFormChange({
                    target: {
                      name: "mDiscPercentage",
                      value: e.target.value,
                    },
                  });
                }}
                className="input input-bordered input-secondary w-[295px] m-5"
                placeholder="MENTIONED DISC %"
                type="number"
                onWheel={(e) => {
                  e.target.blur();
                }}
              />
            </div>
          )}

          {itemData?.length > 0 && (
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
              placeholder="ITEM / PART NO."
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={itemData}
              value={formData?.itemPartNo && { value: formData.itemPartNo }}
              onChange={(e) => {
                console.log("ITEM SELECT: ", e);
                handleFormChange({
                  target: { name: "itemPartNo", value: e.value },
                });
                handleFormChange({
                  target: {
                    name: "itemLocation",
                    value: e?.loc || "N/A",
                  },
                });
                handleFormChange({
                  target: {
                    name: "mrp",
                    value: e?.mrp,
                  },
                });
              }}
              getOptionLabel={(option) =>
                `${option["value"]} ${option["pn"] || ""}`
              }
              noOptionsMessage={() => {
                return (
                  <p
                    onClick={() => router.push("/purchase/item")}
                    className="hover:cursor-pointer"
                  >
                    ➕ Add Item
                  </p>
                );
              }}
            />
          )}

          <div>
            <input
              onChange={(e) => {
                handleFormChange({
                  target: { name: "quantity", value: e.target.value },
                });
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
                handleFormChange({
                  target: { name: "mrp", value: e.target.value },
                });
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
              placeholder="GST %"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={gstAmount}
              getOptionLabel={(option) => `${option["value"]}`}
              value={
                formData?.gstPercentage && { value: formData.gstPercentage }
              }
              onChange={(e) => {
                console.log(e);
                handleFormChange({
                  target: { name: "gstPercentage", value: e.value },
                });
              }}
            />
          )}
        </div>

        <input
          onChange={(e) => {
            handleFormChange({
              target: { name: "amount", value: e.target.value },
            });
          }}
          value={formData?.amount || ""}
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="Total Amount"
          type="number"
          hidden={formData?.purchaseType === "DM"}
          onWheel={(e) => {
            e.target.blur();
          }}
        />

        <br />
      </div>

      <div className="py-20"></div>
      {/* Bottom Nav Bar */}
      <div className="btm-nav glass bg-blue-800">
        <button
          onClick={() => {
            createSheet();
          }}
          className=" text-white hover:bg-blue-900"
        >
          <Image
            className=""
            src="/assets/images/download (1).png"
            width={50}
            height={50}
            alt="icon"
          ></Image>
          <span className="mb-6 text-xl font-mono">Download</span>
        </button>
        <button
          onClick={() => {
            addSingleFormContent();
          }}
          className="text-white hover:bg-blue-900"
        >
          <Image
            className="mb-20"
            src="/assets/images/add-button.png"
            width={70}
            height={70}
            alt="icon"
          ></Image>
        </button>
        <button onClick={() => {}} className="text-white hover:bg-blue-900">
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
