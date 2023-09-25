"use client";

import { useState, useEffect, useRef } from "react";
import Select, { createFilter } from "react-select";
import Itemgroup from "../../DB/Purchase/Itemgroup";
import unitypes from "../../DB/Purchase/unitypes";
import gstAmount from "../../DB/Purchase/gstamount";
import Image from "next/image";
import CustomOption from "../../Dropdown/CustomOption";
import CustomMenuList from "../../Dropdown/CustomMenuList";
import { useRouter } from "next/navigation";
import xlsx from "json-as-xlsx";
import { uploadItem } from "../../AppScript/script";

const Page = () => {
  const router = useRouter();
  const aliasRef = useRef(null);

  useEffect(() => {
    // check for local storage
    checkForUnsaved();
    getInvoice();

    const unsubscribe = window.addEventListener("EXPO_LS_EVENT", function () {
      // * This is for the expo app, using for scanning bar codes.
      digLocalStorageQR(); // * This function is in the app.js file.
    });
    return () => {
      window.removeEventListener("EXPO_LS_EVENT", unsubscribe);
    };
  }, []);

  const [Invoice, setInvoice] = useState("");
  const [PartyName, setPartyName] = useState("");
  const [PageLoaded, setPageLoaded] = useState(false);

  const getInvoice = () => {
    const inv = localStorage.getItem("US_INV_REFERER") || "";
    const party = localStorage.getItem("US_PN_REFERER") || "";
    setInvoice(inv);
    setPartyName(party);
    setPageLoaded(true);
  };

  const [DATA, setDATA] = useState({
    Item_Name: "",
    Item_Alias: "",
    Item_Group: "",
    Item_Main_Unit: "",
    Tax_Category: "", // text eg. 28%
    HSN: "",
    MRP: "", // two decimal number.
    Loc: "",
    MRP_Wise_Details: "Y",
  });

  const [Content, setContent] = useState([]);
  const [modalMessage, setModalMessage] = useState({
    message: "",
    title: "",
    btn: "",
  });

  // adding object to the content array

  const addObject = (obj) => {
    const copiedObject = JSON.parse(JSON.stringify(obj)); // * deep copy
    setContent((prevItems) => [...prevItems, copiedObject]);
  };

  const digLocalStorageQR = () => {
    aliasRef.current.value = localStorage.getItem("EXPO_SCN_RESULT") || "";
    DATA.Item_Alias = localStorage.getItem("EXPO_SCN_RESULT") || "";
  };

  const uploadItemList = async (d) => {
    setModalMessage({
      message: "Item uploading is in process...",
      title: "Wait ⌛",
      btn: null,
    });
    window.my_modal_1.showModal();

    const payload = {
      item_name: d.Item_Name?.toUpperCase(),
      loc: d.Loc?.toUpperCase(),
      part_no: d.Item_Alias?.toUpperCase(),
      unit: d.Item_Main_Unit,
      mrp: d?.MRP,
      gst: d?.Tax_Category?.split("%")[0],
    };

    try {
      const response = await uploadItem(payload);
      // const response = "200"; // * for testing purpose

      if (response === "200") {
        addObject(d);
        storeUnsaved(d); // saving in local storage.
        setModalMessage({
          message: "The data has been added to the excel & dropdown!",
          title: "Success ✅",
          btn: "Ok",
        });
        window.my_modal_1.showModal();
      } else {
        setModalMessage({
          message: "Error while saving data kindly retry.",
          title: "Failed ❌",
          btn: "Ok",
        });
        window.my_modal_1.showModal();
      }
    } catch (error) {
      setModalMessage({
        message: "Error while saving data kindly retry.",
        title: "Failed ❌",
        btn: "Ok",
      });
      window.my_modal_1.showModal();
    }
  };

  const checkForUnsaved = () => {
    if (localStorage.getItem("US_ADDED_ITEMS")) {
      // first check if the router inv is equal to the saved inv. then don't popup just agree the restore permission.
      if (localStorage.getItem("PURCHASE_NOT_DOWNLOAD_DATA")) {
        agreeRestore();
        setModalMessage({
          message: "Previous added items are restored!",
          title: "Restored 📁",
          btn: "Ok",
        });
        window.my_modal_1.showModal();
      } else {
        const US_INV = JSON.parse(
          localStorage.getItem("PURCHASE_NOT_DOWNLOAD_DATA")
        )?.[0]?.InvoiceNumber;
        setModalMessage({
          message: `Unsaved items found ${
            US_INV || ""
          }. Do you want to restore or download it ?`,
          title: "Unsaved 🔎",
          agree: "YES",
          disagree: "NO",
        });
        window.my_modal_1.showModal();
      }
    }
  };

  const agreeRestore = () => {
    const retrievedArray =
      JSON.parse(localStorage.getItem("US_ADDED_ITEMS")) || [];
    setContent(retrievedArray);
  };

  const disagreeRestore = () => {
    localStorage.removeItem("US_ADDED_ITEMS");
    localStorage.removeItem("US_ADDED_ITEMS_INV");
  };

  const storeUnsaved = (obj) => {
    // const invoiceNumber = "INV-985TY";
    // localStorage.setItem("US_ADDED_ITEMS_INV", invoiceNumber);
    const retrievedArray =
      JSON.parse(localStorage.getItem("US_ADDED_ITEMS")) || [];
    retrievedArray.push(obj);
    localStorage.setItem("US_ADDED_ITEMS", JSON.stringify(retrievedArray));
  };

  const pushContent = () => {
    console.log(DATA);

    let isEmpty = false;
    for (const key in DATA) {
      if (DATA[key] === "") {
        isEmpty = true;
        break;
      }
    }

    if (isEmpty) {
      setModalMessage({
        message: "At least one value (field) is empty!",
        title: "Empty 🫙",
        btn: "Ok",
      });
      window.my_modal_1.showModal();
      return;
    } else {
      uploadItemList(DATA);
    }
  };

  const createExcelSheet = () => {
    if (Content?.length === 0) {
      setModalMessage({
        message: "At least add one item before generating excel!",
        title: "Invalid ❌",
        btn: "Ok",
      });
      window.my_modal_1.showModal();
      return;
    }

    // empty array

    let content = [];

    Content.forEach((item) => {
      content.push(item);
    });

    let data = [
      {
        sheet: "Sheet1",
        columns: [
          { label: "Item_Name", value: "Item_Name" },
          { label: "Item_Alias", value: "Item_Alias" },
          { label: "Item_Group", value: "Item_Group" },
          { label: "Item_Main_Unit", value: "Item_Main_Unit" },
          { label: "Tax_Category", value: "Tax_Category" },
          { label: "HSN", value: "HSN" },
          { label: "MRP", value: "MRP", format: "0.00" },
          { label: "Loc", value: "Loc" },
          { label: "MRP wise details", value: "MRP_Wise_Details" },
        ],
        content,
      },
    ];

    downloadExcel(data);
  };

  const downloadExcel = (data) => {
    if (Invoice.length === 0 || PartyName.length === 0) {
      alert("⚠ Kindly set a Invoice No or Party Name!");
      return;
    }

    const settings = {
      fileName: `NEW ITEM-${PartyName?.toUpperCase()}-${Invoice?.toUpperCase()}-${new Date().getTime()}`,
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
      sendPurchaseHistory(PartyName, Invoice, data);
      disagreeRestore(); // to completely remove saved items.
      localStorage.removeItem("US_INV_REFERER");
      localStorage.removeItem("US_PN_REFERER");
    };
    xlsx(data, settings, callback);
  };

  //

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
      desc: "New Item",
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
        alert("❌ The item is not uploaded to the history.", err);
      });
  };

  return (
    <>
      <dialog id="my_modal_1" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">{modalMessage?.title}</h3>
          <p className="py-2">{modalMessage?.message}</p>

          <div className="modal-action">
            {modalMessage.btn ? (
              <button className="btn">{modalMessage.btn}</button>
            ) : null}
            {modalMessage?.agree && modalMessage?.disagree ? (
              <div>
                <button onClick={agreeRestore} className="btn m-3">
                  {modalMessage.agree}
                </button>
                <button onClick={disagreeRestore} className="btn">
                  {modalMessage.disagree}
                </button>
              </div>
            ) : null}
          </div>
        </form>
      </dialog>
      <p className="glass text-center text-[40px] font-mono mb-9 rounded-xl m-5">
        ADD ITEM
      </p>
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="ENTER ITEM NAME"
          type="text"
          onChange={(e) => {
            DATA.Item_Name = e.target?.value;
          }}
        />
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="ENTER PART NUMBER"
          type="text"
          ref={aliasRef}
          onChange={(e) => {
            DATA.Item_Alias = e.target?.value;
          }}
        />

        {PageLoaded ? (
          <>
            <input
              value={PartyName}
              className="input input-bordered input-secondary w-[320px] m-5 uppercase"
              placeholder="ENTER PARTY NAME"
              type="text"
              onChange={(e) => {
                setPartyName(e.target?.value);
                localStorage.setItem("US_PN_REFERER", e?.target?.value);
              }}
            />
            <input
              value={Invoice}
              className="input input-bordered input-secondary w-[320px] m-5 uppercase"
              placeholder="ENTER INVOICE"
              type="text"
              onChange={(e) => {
                setInvoice(e.target?.value);
                localStorage.setItem("US_INV_REFERER", e?.target?.value);
              }}
            />
          </>
        ) : null}
      </div>

      <Select
        //  The value Needed To Be Added From Excel Sheet
        placeholder="ITEM GROUP"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        filterOption={createFilter({ ignoreAccents: false })}
        components={{ Option: CustomOption, MenuList: CustomMenuList }}
        options={Itemgroup}
        getOptionLabel={(option) => `${option["value"]}`}
        onChange={(e) => {
          DATA.Item_Group = e?.value;
        }}
      />
      <Select
        placeholder="UNIT TYPE"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={unitypes}
        getOptionLabel={(option) => `${option["value"]}`}
        isSearchable={false}
        onChange={(e) => {
          DATA.Item_Main_Unit = e?.value;
        }}
      />
      <Select
        placeholder="TAX CATEGORY "
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={gstAmount}
        isSearchable={false}
        onChange={(e) => {
          DATA.Tax_Category = e?.value;
        }}
      />

      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="HSN CODE "
          type="text"
          onChange={(e) => {
            DATA.HSN = e.target?.value;
          }}
        />
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="MRP"
          type="number"
          onChange={(e) => {
            const d_format = parseFloat(e.target?.value);
            DATA.MRP = Math.round(d_format * 100) / 100;
          }}
          onWheel={(e) => {
            e.target.blur();
          }}
        />
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="LOCATION"
          type="text"
          onChange={(e) => {
            DATA.Loc = e.target?.value;
          }}
        />
      </div>
      <div className="pb-40"></div>

      <div className="btm-nav glass bg-blue-800">
        <button
          onClick={() => {
            createExcelSheet(); // download the file.
          }}
          className="text-white hover:bg-blue-900"
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
            // uploadItem({ item_name: "ABCD", loc: "BIN-69", part_no: "PP90" });
            pushContent();
          }}
          className="text-white hover:bg-blue-900"
        >
          <Image
            className="mb-20"
            src="/assets/images/uploadfile.png"
            width={70}
            height={70}
            alt="icon"
          ></Image>
        </button>
        <button
          onClick={() => {
            if (Content?.length > 0) {
              router.push(`/purchase/?fromNewItem=true`);
            } else {
              router.back();
            }
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
};

export default Page;
