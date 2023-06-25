"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import { useState, useEffect } from "react";
import Select, { createFilter } from "react-select";
import gstAmount from "./DB/gstamount";
import partyname from "./DB/partyname";
import gstType from "./DB/gsttype";
import {
  InclusiveCalc,
  ExclusiveCalc,
  ExemptCalc,
  TotalAmountCalc,
} from "./Disc/disc";
import Image from "next/image";
import CustomOption from "./Dropdown/CustomOption";
import CustomMenuList from "./Dropdown/CustomMenuList";
import { useRouter } from "next/navigation";

export default function Home() {
  useEffect(() => {
    getItemsExcel();
    alertUnsavedData();
  }, []);
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
  const router = useRouter();

  const addObject = (obj) => {
    setExcelContent((prevArray) => [...prevArray, obj]);
  };

  const alertUnsavedData = () => {
    if (localStorage.getItem("US_PURC")) {
      setModalMessage({
        message: "We found an unsaved work! do you want to restore it ?",
        title: "Unsaved 🔎",
        u_data: JSON.parse(localStorage.getItem("US_PURC")),
        option: true,
        btn: "Ok",
      });
      window.my_modal_1.showModal();
    }
  };

  const restoreUnsaved = () => {
    const data = JSON.parse(localStorage.getItem("US_PURC"));
    setExcelContent(data);

    Data.InvoiceNumber = data[0].InvoiceNumber;

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
      .catch((error) => console.error(error));
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

    // do not touch this.
    ExcelContent.forEach((e) => {
      content.push(e);
    });

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
          // { label: "Invoice Date", value: "InvoiceDate" },
          { label: "QTY", value: "Quantity", format: "0" },
          { label: "Unit", value: "unit" },
          { label: "PRICE", value: "MRP", format: "0.00" },
          { label: "DISC%", value: "disc", format: "0.00" },
          { label: "Amount", value: "TotalAmount", format: "0.00" },
          { label: "CGST", value: "cgst", format: "0" },
          { label: "SGST", value: "sgst", format: "0" },
        ],
        content,
      },
    ];

    DownloadExcel(Data.PartyName, Data.InvoiceNumber, data);
  };

  const pushContent = () => {
    // appropriate format of date eg. 21-05-2023
    var dateString = `${Data.InvoiceDate}`;
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

    const PartyName = Data.PartyName;
    const InvoiceNumber = Data.InvoiceNumber?.toUpperCase();
    const ItemName = Data.ItemName;
    const InvoiceDate = formattedDate;
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

    // calculate the amount:

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
    // pushing the new list to the array

    addObject(contentData);
    storeUnsaved(contentData); // storing the unsaved data
    // alert the user

    setModalMessage({
      message: `Item added successfully.`,
      invoice: `Item: ${Data?.ItemName}`,
      extra: `Total Added: ${ExcelContent?.length + 1}`,
      disc: `🏷️ DISC:  ${disc}%`,
      loc: `🗺️ LOC: ${Data?.ItemLoc}`,
      title: "Done ✅",
      btn: "Ok",
    });
    window.my_modal_1.showModal();
  };

  const DownloadExcel = (fileName, invoice, data) => {
    const settings = {
      fileName: `${fileName}-${invoice?.split("-")[1]}`,
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
      localStorage.removeItem("US_PURC");
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

  // const uploadExcel = async () => {
  //   if (!ExcelContent.length > 0) {
  //     setModalMessage({
  //       message: "Nothing for upload! Fill the fields to Upload  item.",
  //       title: "Upload ❌",
  //       btn: "Ok",
  //     });
  //     window.my_modal_1.showModal();
  //     return;
  //   } else {
  //     try {
  //       uploadSheet(ExcelContent);
  //       setModalMessage({
  //         message: "Data has been sent for uploading.",
  //         extra: `Total Sent: ${ExcelContent?.length}`,
  //         title: "Uploading 🚀",
  //         btn: "Ok",
  //       });
  //       window.my_modal_1.showModal();
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  // const clearSheet = async () => {
  //   setModalMessage({
  //     message: "Clearing Online excel is in process!",
  //     title: "Clearing ⌛",
  //     btn: "Ok",
  //   });
  //   window.my_modal_1.showModal();
  //   try {
  //     const response = await clearExcelSheet();
  //     if (response === "200") {
  //       setModalMessage({
  //         message: "Online excel file has been cleared!",
  //         title: "Cleared 🧹",
  //         btn: "Ok",
  //       });
  //       window.my_modal_1.showModal();
  //     } else {
  //       console.log("Clearing failed!");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
            ) : (
              <button className="btn">{modalMessage.btn}</button>
            )}
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
              onChange={(e) => (Data.PartyName = e.value)}
            />
          ) : // <input
          //   className="input input-bordered m-auto p-5 text-blue-800 font-bold input-secondary w-[300px] placeholder-white"
          //   type="text"
          //   placeholder="Party Names Updating..."
          // />
          null}

          <div className="flex justify-center items-center flex-wrap">
            <input
              onChange={(e) => (Data.InvoiceNumber = e.target.value)}
              className="input input-bordered input-secondary m-5 uppercase w-[295px]"
              placeholder="Invoice No"
              type="text"
              disabled={ExcelContent?.length > 0 ? true : false}
              value={
                ExcelContent?.length > 0
                  ? ExcelContent[0].InvoiceNumber
                  : undefined
              }
            />
            <DatePicker
              className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
              selected={startDate}
              placeholderText="Invoice Date"
              onChange={(date) => {
                Data.InvoiceDate = date;
                setStartDate(date);
              }}
            />
          </div>

          <Select
            placeholder="GST Type"
            className="w-full m-auto p-5 text-blue-800 font-bold"
            options={gstType}
            onChange={(e) => {
              Data.GstType = e.value;
              toggleGst(e.value);
            }}
            isSearchable={false}
          />

          {ItemData?.length > 0 ? (
            <Select
              filterOption={createFilter({ ignoreAccents: false })}
              components={{ Option: CustomOption, MenuList: CustomMenuList }}
              placeholder="Item / Part No"
              className="w-full m-auto p-5 text-blue-800 font-bold"
              options={ItemData}
              getOptionLabel={(option) => `${option["value"]} ${option["pn"]}`}
              onChange={(e) => {
                Data.ItemName = e?.value;
                Data.ItemLoc = e?.loc;
              }}
            />
          ) : // <input
          //   className="input input-bordered m-auto p-5 my-5 text-blue-800 font-bold input-secondary w-[300px] placeholder-white"
          //   type="text"
          //   placeholder="Item Names Updating..."
          // />
          null}

          <div>
            <input
              onChange={(e) => (Data.Quantity = e.target.value)}
              className="input input-bordered input-secondary w-[295px] m-5"
              placeholder="Quantity"
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
            <input
              onChange={(e) => (Data.MRP = e.target.value)}
              className="input input-bordered input-secondary w-[295px] m-5"
              placeholder="MRP"
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </div>

          <Select
            placeholder="GST %"
            className="w-full m-auto p-5 text-blue-800 font-bold"
            options={gstAmount}
            onChange={(e) => {
              Data.GstValue = e?.value;
            }}
            isDisabled={toggleGstButton}
            isSearchable={true}
          />
        </div>

        <input
          onChange={(e) => (Data.TotalAmount = e.target.value)}
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="Total Amount"
          type="number"
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
            router.back();
          }}
          className="text-white hover:bg-blue-900"
        >
          <Image
            className=""
            src="/assets/images/undo.png"
            width={50}
            height={50}
            alt="icon"
          ></Image>
          <span className="mb-6 text-xl font-mono">Back</span>
        </button>
      </div>
    </>
  );
}
