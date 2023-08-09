"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import { useState, useEffect, useRef } from "react";
import Select, { createFilter } from "react-select";
import gstAmount from "../DB/gstamount";
import partyname from "../DB/partyname";
import gstType from "../DB/gsttype";
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
import purchasetype from "../DB/purchasetype";

export default function Home(props) {
  const router = useRouter();

  useEffect(() => {
    localStorage.getItem("MOUNT"); // caution
    // setSearchParam(props.searchParams);
    getItemsExcel();
    alertUnsavedData();
    populateDate();
  }, []);

  // const [searchParam, setSearchParam] = useState({});

  // useRef fields

  const totalAmountField = useRef();
  const quantityField = useRef();
  const mrpField = useRef();
  const partNoField = useRef();
  const gstField = useRef();

  const [Data, setData] = useState({
    PartyName: null,
    InvoiceNumber: null,
    ItemName: null,
    ItemLoc: null,
    InvoiceDate: null,
    Quantity: null,
    MRP: null,
    TotalAmount: null,
    GstType: null,
    GstValue: null,
    BILL_REF_AMOUNT: null,
    BILL_REF_DUE_DATE: null,
    MentionedDISC: null,
  });
  const [startDate, setStartDate] = useState(null);
  const [toggleGstButton, settoggleGst] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    message: "",
    title: "",
    btn: "",
  });
  const [LoadingExcel, setLoadingExcel] = useState(true);
  const [ExcelContent, setExcelContent] = useState([]);
  const [ItemData, setItemData] = useState([]);
  const [PartyData, setPartyData] = useState([]);
  const [purchaseType, setPurchaseType] = useState("DNM");

  const addObject = (obj) => {
    setExcelContent((prevArray) => [...prevArray, obj]);
  };

  const removeLocalStorage = () => {
    // all the items are of purchase page.
    localStorage.removeItem("US_PURC");
    localStorage.removeItem("US_INVD_REFERER");
    localStorage.removeItem("US_GT_REFERER");
    localStorage.removeItem("US_PN_REFERER");
    localStorage.removeItem("US_INV_REFERER");
  };

  const populateDate = () => {
    let savedDate = localStorage.getItem("US_INVD_REFERER");

    if (savedDate && savedDate !== "null") {
      savedDate = new Date(savedDate);
      setStartDate(savedDate);
      Data.InvoiceDate = savedDate;
    }

    // Gst Type

    Data.GstType =
      localStorage.getItem("US_GT_REFERER") &&
      localStorage.getItem("US_GT_REFERER")?.length > 0
        ? localStorage.getItem("US_GT_REFERER")
        : null;

    // Party Name

    Data.PartyName =
      localStorage.getItem("US_PN_REFERER") &&
      localStorage.getItem("US_PN_REFERER")?.length > 0
        ? localStorage.getItem("US_PN_REFERER")
        : null;

    // invoice

    if (localStorage.getItem("US_INV_REFERER")) {
      Data.InvoiceNumber = localStorage.getItem("US_INV_REFERER");
    }
  };

  const alertUnsavedData = () => {
    if (localStorage.getItem("US_PURC") || ExcelContent?.length === 0) {
      // the first item is new item
      if (
        props?.searchParams?.itemname &&
        props?.searchParams?.gst &&
        props?.searchParams?.mrp
      ) {
        // when we found both unsaved data and param.
        restoreUnsaved();
        Data.MRP = props?.searchParams?.mrp;
        Data.GstValue = props?.searchParams?.gst;
        Data.ItemName = props?.searchParams?.itemname?.toUpperCase();
        Data.ItemLoc = props?.searchParams?.loc;
        return;
      }

      if (localStorage.getItem("US_PURC")) {
        // after the user completely reset or download Excel
        setModalMessage({
          message: "We found an unsaved work! do you want to restore it ?",
          title: "Unsaved 🔎",
          u_data: JSON.parse(localStorage.getItem("US_PURC")),
          option: true,
          btn: "Ok",
        });
        window.my_modal_1.showModal();
      }
    }
  };

  const restoreUnsaved = () => {
    const data = JSON.parse(localStorage.getItem("US_PURC")) || [];
    setExcelContent(data);

    Data.InvoiceNumber = data?.[0]?.InvoiceNumber || null;

    setModalMessage({
      message: "The unsaved data has been restored.",
      title: "Restored 📁",
      btn: "Ok",
    });
  };

  const storeUnsaved = (obj) => {
    const retrievedArray = JSON.parse(localStorage.getItem("US_PURC")) || [];
    retrievedArray.push(obj);
    localStorage.setItem("US_PURC", JSON.stringify(retrievedArray));
  };

  const getItemsExcel = async () => {
    Promise.all([
      fetch(
        "https://script.google.com/macros/s/AKfycbx3G0up1xJoNIJqXLRdmSLQ09OPtwKnTfi8uWPzEw-vCUT4nwvluEmwOA3CKinO6PJhPg/exec"
      ),
      fetch(
        "https://script.google.com/macros/s/AKfycbwr8ndVgq8gTbhOCRZChJT8xEOZZCOrjev29Uk6DCDLQksysu80oTb8VSnoZMsCQa3g/exec"
      ),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((data) => {
        // data[0] contains the items
        // data[1] contains the party

        const item_names = data[0];
        const party_names = data[1];

        setPartyData(party_names);
        setItemData(item_names);

        setLoadingExcel(false);
        // localStorage.setItem("ITEM_NAMES", JSON.stringify(item_names));
        // localStorage.setItem("PARTY_NAMES", JSON.stringify(party_names));
      })
      .catch((error) => {
        console.error(error);
        setModalMessage({
          message: "Kindly check your internet connection or reopen the app!",
          title: "Error ⚠️",
          btn: "Ok",
        });
        window.my_modal_1.showModal();
      });
  };

  const createSheet = () => {
    if (ExcelContent.length === 0) {
      setModalMessage({
        message: "At least add one item before generating excel!",
        title: "Invalid ❌",
        btn: "Ok",
      });
      window.my_modal_1.showModal();
      return;
    } else {
    }
    // empty variable to restore.

    let content = [];
    let BILL_REF_AMOUNT = 0;

    // do not touch this.
    ExcelContent.forEach((e) => {
      content.push(e);
      BILL_REF_AMOUNT += e?.TotalAmount;
    });
    content[0].BILL_REF_AMOUNT = Math.round(BILL_REF_AMOUNT);

    let data = [
      {
        sheet: "Sheet1",
        columns: [
          { label: "BILL SERIES", value: "bill" },
          { label: "BILL DATE", value: "billDate" },
          { label: "Purc Type", value: "PurcType" },
          { label: "PARTY NAME", value: "partyname" },
          { label: "ITC ELIGIBILITY", value: "Eligibility" },
          { label: "NARRATION", value: "InvoiceNumber" },
          { label: "ITEM NAME", value: "ItemName" },
          { label: "QTY", value: "Quantity", format: "0" },
          { label: "Unit", value: "unit" },
          { label: "PRICE", value: "MRP", format: "0.00" },
          { label: "DISC%", value: "disc", format: "0.00" },
          { label: "Amount", value: "TotalAmount", format: "0.00" },
          { label: "CGST", value: "cgst", format: "0" },
          { label: "SGST", value: "sgst", format: "0" },

          { label: "BILL_REF", value: "InvoiceNumber" },
          {
            label: "BILL_REF_AMOUNT",
            value: "BILL_REF_AMOUNT",
            format: "0",
          },
          {
            label: "BILL_REF_DUE_DATE",
            value: "BILL_REF_DUE_DATE",
          },
        ],
        content,
      },
    ];

    DownloadExcel(content[0]?.partyname, content[0]?.InvoiceNumber, data);
  };

  const pushContent = () => {
    // appropriate format of date eg. 21-05-2023

    const convertToDateString = (date) => {
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

    const PartyName = Data.PartyName;
    const InvoiceNumber = Data.InvoiceNumber?.toUpperCase();
    const ItemName = Data.ItemName;
    const InvoiceDate = convertToDateString(Data.InvoiceDate);
    const Quantity = Data.Quantity;
    const MRP = Data.MRP;
    const gstType = Data.GstType;
    let GstValue = parseInt(Data?.GstValue?.split("%")[0]?.trim()) || "0";
    let cgst = "0";
    let Amount = 0;
    let disc = 0;
    let bill = "GST";
    let purc_type = "";
    let eligibility = "Goods/Services";
    if (
      !partyname ||
      !InvoiceDate ||
      !InvoiceNumber ||
      !ItemName ||
      !Quantity ||
      !MRP ||
      !Data.TotalAmount ||
      !gstType ||
      !GstValue
    ) {
      console.log(Data);
      setModalMessage({
        message: "Some fields are empty! Fill the fields to add  item.",
        title: "Empty ❌",
        btn: "Ok",
      });
      window.my_modal_1.showModal();
      return;
    }

    if (Data?.GstType === "Exempt") {
      GstValue = 0;
      bill = "Main";
      cgst = 0;
      purc_type = "EXEMPT";
      disc = ExemptCalc(MRP, Data?.TotalAmount, Quantity);
      eligibility = "None";
    } else if (Data?.GstType === "Inclusive") {
      purc_type = "GST(INCL)";
      disc = InclusiveCalc(MRP, Data?.TotalAmount, Quantity);
      cgst = parseInt(GstValue / 2);
      if (GstValue === "0") {
        setModalMessage({
          message: "GST% field is empty. Kindly fill it!",
          title: "Empty ❌",
          btn: "Ok",
        });
        window.my_modal_1.showModal();
        return;
      }
    } else {
      purc_type = "GST(INCL)";
      disc = ExclusiveCalc(MRP, Data?.TotalAmount, GstValue, Quantity);
      cgst = parseInt(GstValue / 2);
      if (GstValue === "0") {
        setModalMessage({
          message: "GST% field is empty. Kindly fill it!",
          title: "Empty ❌",
          btn: "Ok",
        });
        window.my_modal_1.showModal();
        return;
      }
    }

    if (purchaseType === "DM" && Data?.GstType === "Exclusive") {
      disc = exclusiveDM(MRP, Quantity, Data?.MentionedDISC, GstValue);
    } else if (purchaseType === "DM") {
      disc = Data?.MentionedDISC;
    }

    // calculate the Total amount:

    Amount = TotalAmountCalc(MRP, disc, Quantity);

    let contentData = {
      bill: bill,
      billDate: InvoiceDate,
      PurcType: purc_type,
      partyname: PartyName,
      Eligibility: eligibility,
      InvoiceNumber: InvoiceNumber,
      ItemName: ItemName,
      // InvoiceDate: `${InvoiceDate && InvoiceDate ? InvoiceDate : "N/A"}`,
      Quantity: parseInt(Quantity),
      unit: "Pcs",
      MRP: parseFloat(MRP),
      disc: disc,
      TotalAmount: parseFloat(Amount),
      cgst: cgst,
      sgst: cgst,
    };

    if (ExcelContent?.length === 0) {
      // credit days function

      const getFutureDate = (curDate, fuDay) => {
        const tempDate = new Date(curDate);
        tempDate.setDate(tempDate.getDate() + fuDay);
        return tempDate;
      };

      const futureCreditDay = convertToDateString(
        getFutureDate(Data.InvoiceDate, Data.BILL_REF_DUE_DATE)
      );

      contentData.BILL_REF_DUE_DATE = futureCreditDay;
    }

    const confirmedSave = () => {
      // pushing the new list to the array
      addObject(contentData);
      storeUnsaved(contentData);

      // storing the unsaved data

      // clearing the fields

      totalAmountField.current.value = null;
      quantityField.current.value = null;
      mrpField.current.value = null;
      // gstField.current.clearValue;
      // partNoField.current.clearValue;

      Data.TotalAmount = purchaseType === "DM" ? 1 : null;
      Data.MRP = null;
      Data.Quantity = null;
      // Data.GstValue = null;
      // Data.ItemName = null;
      // Data.ItemLoc = null;

      console.log();
    };

    // alert the user

    setModalMessage({
      message: `Press OK to add the purchase.`,
      invoice: `Item: ${Data?.ItemName}`,
      extra: `Total Added: ${ExcelContent?.length + 1}`,
      disc: `🏷️ DISC:  ${disc}%`,
      loc: `🗺️ LOC: ${Data?.ItemLoc}`,
      title: "Confirm ❓",
      btn: "Ok",
      reconfirm_save: confirmedSave,
      editShow: true,
    });
    window.my_modal_1.showModal();
  };

  // send data to history

  const sendPurchaseHistory = (partyname, invoice, sheet) => {
    setModalMessage({
      message: `🚀 Saving the data to cloud...`,
      title: "⏳ Wait",
    });

    const payload = {
      sheetdata: JSON.stringify(sheet),
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
          setModalMessage({
            message: `🚀 Saved to cloud.`,
            title: "✔ Done",
            btn: "Ok",
          });
        } else {
          setModalMessage({
            message: `❌ Saved to cloud failed.`,
            title: "❌ failed",
            btn: "Ok",
          });
        }
      })
      .catch((err) => {
        setModalMessage({
          message: `❌ Saved to cloud failed.`,
          title: "❌ failed",
          btn: "Ok",
        });
      });
  };

  const DownloadExcel = (fileName, invoice, data) => {
    const settings = {
      fileName: `${fileName}-${invoice?.split("-")[1] || invoice}`,
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };
    let callback = function () {
      setModalMessage({
        message: `📁 Excel File downloaded Successfully!`,
        title: "Done ✅",
        btn: "Ok",
      });
      window.my_modal_1.showModal();
      sendPurchaseHistory(fileName, invoice, data);

      // clear the local storage.
      removeLocalStorage();
      if (
        props?.searchParams?.itemname &&
        props?.searchParams?.gst &&
        props?.searchParams?.mrp
      ) {
        window.location.href = "/";
      }
    };
    xlsx(data, settings, callback);
  };

  const toggleGst = (type) => {
    if (type === "Exempt") {
      settoggleGst(true);
    } else {
      settoggleGst(false);
    }
  };

  return (
    <>
      {/* Open the modal using ID.showModal() method */}

      <dialog id="my_modal_1" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">{modalMessage?.title}</h3>
          <p className="py-2">{modalMessage?.message}</p>
          {modalMessage?.invoice ||
          modalMessage?.extra ||
          modalMessage?.disc ? (
            <div>
              <p className="py-1">{modalMessage?.invoice}</p>
              <p className="py-1">{modalMessage?.extra}</p>
              <p className="py-1 text-xl font-extrabold">
                {modalMessage?.disc}
              </p>
              <p className="py-1 text-xl font-extrabold">{modalMessage?.loc}</p>
            </div>
          ) : null}
          {modalMessage?.u_data ? (
            <div className="flex gap-2 overflow-x-scroll">
              {modalMessage?.u_data?.map((d, index) => {
                return <p key={index}>{d?.ItemName}</p>;
              })}
            </div>
          ) : null}

          <div className="modal-action">
            {modalMessage?.option ? (
              <div>
                <button onClick={restoreUnsaved} className="btn m-3">
                  Yes
                </button>
                <button
                  onClick={() => localStorage.removeItem("US_PURC")}
                  className="btn"
                >
                  No
                </button>
              </div>
            ) : modalMessage?.editShow ? null : (
              <button className="btn">{modalMessage.btn}</button>
            )}

            {modalMessage?.editShow ? (
              <div>
                <button
                  className="btn m-2"
                  onClick={() => {
                    modalMessage.reconfirm_save();
                  }}
                >
                  Ok
                </button>
                <button className="btn">Edit</button>
              </div>
            ) : null}
          </div>
        </form>
      </dialog>

      <div className="text-center m-auto">
        {LoadingExcel ? (
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        ) : null}

        <div className="m-5 flex justify-between flex-col">
          {PartyData?.length > 0 ? (
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
              placeholder="Party Name"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              getOptionLabel={(option) => `${option["value"]}`}
              options={PartyData}
              isClearable={true}
              defaultInputValue={
                localStorage.getItem("US_PN_REFERER")
                  ? localStorage.getItem("US_PN_REFERER")
                  : ""
              }
              onChange={(e) => {
                Data.PartyName = e?.value || "";
                localStorage.setItem("US_PN_REFERER", `${Data.PartyName}`);
                Data.BILL_REF_DUE_DATE =
                  e?.creditDays === "" || isNaN(e?.creditDays)
                    ? 0
                    : e?.creditDays;
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
          ) : null}

          <div className="flex justify-center items-center flex-wrap">
            {!LoadingExcel ? (
              <input
                onChange={(e) => {
                  Data.InvoiceNumber = e.target.value;
                  localStorage.setItem("US_INV_REFERER", e.target.value);
                }}
                className="input input-bordered input-secondary m-5 uppercase w-[295px]"
                placeholder="Invoice No"
                type="text"
                disabled={ExcelContent?.length > 0 ? true : false}
                defaultValue={
                  ExcelContent?.length > 0
                    ? ExcelContent[0].InvoiceNumber
                    : localStorage.getItem("US_INV_REFERER")
                    ? localStorage.getItem("US_INV_REFERER")
                    : undefined || ""
                }
              />
            ) : null}

            <DatePicker
              className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
              isClearable={true}
              selected={startDate}
              placeholderText="Invoice Date"
              onChange={(date) => {
                Data.InvoiceDate = date;
                setStartDate(date);
                localStorage.setItem("US_INVD_REFERER", `${Data.InvoiceDate}`);
              }}
            />
          </div>

          {!LoadingExcel ? (
            <Select
              placeholder="GST Type"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={gstType}
              onChange={(e) => {
                Data.GstType = e?.value || "";
                localStorage.setItem("US_GT_REFERER", `${Data.GstType}`);
                toggleGst(e?.value);
              }}
              isClearable={true}
              defaultInputValue={
                localStorage.getItem("US_GT_REFERER")
                  ? localStorage.getItem("US_GT_REFERER")
                  : ""
              }
              getOptionLabel={(option) => `${option["value"]}`}
              isSearchable={
                localStorage.getItem("US_GT_REFERER") ? true : false
              }
            />
          ) : null}
          {!LoadingExcel ? (
            <div>
              <Select
                placeholder="Purchase Type"
                className="w-full m-auto p-5 text-blue-800 font-bold"
                isSearchable={false}
                options={purchasetype}
                onChange={(e) => {
                  setPurchaseType(e?.value);
                }}
                defaultValue={{ label: "Discount Not Mentioned", value: "DNM" }}
                isClearable={false}
              />
              <input
                hidden={purchaseType === "DNM"}
                onChange={(e) => {
                  Data.MentionedDISC = parseFloat(e.target.value);
                  Data.TotalAmount = 1;
                }}
                className="input input-bordered input-secondary w-[295px] m-5"
                placeholder="DISC %"
                type="number"
                onWheel={(e) => {
                  e.target.blur();
                }}
              />
            </div>
          ) : null}

          {ItemData?.length > 0 ? (
            <Select
              ref={partNoField}
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
              defaultInputValue={
                props?.searchParams?.itemname
                  ? props?.searchParams?.itemname
                  : ""
              }
              placeholder="Item / Part No"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={ItemData}
              getOptionLabel={(option) => `${option["value"]} ${option["pn"]}`}
              onChange={(e) => {
                Data.ItemName = e?.value;
                Data.ItemLoc = e?.loc;
              }}
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
          ) : null}

          <div>
            <input
              onChange={(e) => (Data.Quantity = e.target.value)}
              className="input input-bordered input-secondary w-[295px] m-5"
              placeholder="Quantity"
              type="number"
              ref={quantityField}
              onWheel={(e) => {
                e.target.blur();
              }}
            />
            <input
              onChange={(e) => (Data.MRP = e.target.value)}
              className="input input-bordered input-secondary w-[295px] m-5"
              placeholder="MRP"
              ref={mrpField}
              type="number"
              defaultValue={
                props?.searchParams?.mrp
                  ? parseFloat(props?.searchParams?.mrp)
                  : undefined
              }
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </div>

          {!LoadingExcel ? (
            <Select
              ref={gstField}
              placeholder="GST %"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={gstAmount}
              onChange={(e) => {
                Data.GstValue = e?.value;
              }}
              defaultInputValue={
                props?.searchParams?.gst ? props?.searchParams?.gst : ""
              }
              // isDisabled={toggleGstButton}
              isDisabled={
                localStorage.getItem("US_GT_REFERER") === "Exempt"
                  ? true
                  : toggleGstButton
              }
              isSearchable={true}
              isClearable={true}
            />
          ) : null}
        </div>

        <input
          onChange={(e) => (Data.TotalAmount = e.target.value)}
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="Total Amount"
          type="number"
          ref={totalAmountField}
          hidden={purchaseType === "DM"}
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
            pushContent();
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
        <button
          onClick={() => {
            removeLocalStorage();
            window.location.href = "/purchase";
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