"use client";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Select, { createFilter } from "react-select";
import Image from "next/image";
import CustomOption from "../Dropdown/CustomOption";
import CustomMenuList from "../Dropdown/CustomMenuList";
import xlsx from "json-as-xlsx";
import { useEffect, useState } from "react";
import { uploadItem } from "../AppScript/script";

export default function Page() {
  // ****

  useEffect(() => {
    getAPIContent();
    const unsubscribe = window.addEventListener("EXPO_LS_EVENT", function () {
      // * This is for the expo app, using for scanning bar codes.
      digLocalStorageQR();
    });
    return () => {
      window.removeEventListener("EXPO_LS_EVENT", unsubscribe);
    };
  }, []);

  const digLocalStorageQR = () => {
    let localSavedItemApi = [];

    if (localSavedItemApi?.length === 0) {
      setQrResult("🔍 Searching...");
    }

    const setLocalITEM_API = (data) => {
      localSavedItemApi = data;
    };

    checkLocalStorageSaved("ITEM_API_DATA", setLocalITEM_API);

    // * This function will get the local item whenever the event "EXPO_LS_EVENT" triggered.

    const res = localStorage.getItem("EXPO_SCN_RESULT");
    const result = localSavedItemApi.find(
      (obj) => obj.pn !== "" && res.includes(obj.pn)
    );

    if (result?.value) {
      console.log("SCN_RES", result);
      setQrResult(`✔ ${result?.value}-${result?.pn}`);

      // * setting the matched value
      handleChange({ target: { name: "unitType", value: result?.unit } });
      handleChange({ target: { name: "mrp", value: result?.mrp || null } });
      handleChange({ target: { name: "item", value: result?.value } });
      handleChange({ target: { name: "selectedItemRow", value: result?.row } });
      if (formData?.seriesType === "MAIN") return;
      handleChange({
        target: { name: "gstAmount", value: result?.gst || null },
      });
    } else {
      localSavedItemApi?.length === 0
        ? setQrResult(`❓ Oops! Kindly retry..`)
        : setQrResult(`❌ No match: ${res}`);
    }
  };

  const [formData, setFormData] = useState({
    stockDate: new Date(), // default today.
    item: null,
    quantity: null,
    mrp: null,
    location: null,
    purc_price: null,
    selectedItemRow: -1,
  });

  const [modalMessage, setModalMessage] = useState({
    message: null,
  });

  const [ItemAPIData, setItemAPIData] = useState([]);
  const [APILoading, setAPILoading] = useState(true);
  const [ExcelContent, setExcelContent] = useState([]);
  const [qrResult, setQrResult] = useState("...");

  // * for uncommon useState alternative

  const handleChange = (event) => {
    const name = event.target?.name;
    const value = event.target?.value;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleModalMessage = (message) => {
    const name = message?.name;
    const value = message?.value;
    setModalMessage((values) => ({ ...values, [name]: value }));
  };

  const isFormValidated = (form) => {
    for (let key in form) {
      if (form[key] === null || form[key] === undefined || form[key] === "") {
        if (key === "purc_price") continue;
        handleModalMessage({
          name: "message",
          value: `📜 The field "${key
            .replace(/[A-Z]/g, (match) => " " + match)
            .trim()
            .toUpperCase()}" is empty.`,
        });
        window.stockModal_1.showModal();
        return false;
      }
    }
    return true;
  };

  // API CALLS

  const getAPIContent = async () => {
    // check for local storage (fast loading)
    checkLocalStorageSaved("ITEM_API_DATA", setItemAPIData);

    // calls apis simultaneously

    Promise.all([
      fetch(
        "https://script.google.com/macros/s/AKfycbx3G0up1xJoNIJqXLRdmSLQ09OPtwKnTfi8uWPzEw-vCUT4nwvluEmwOA3CKinO6PJhPg/exec"
      ),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((data) => {
        const item_api_data = data[0];

        // item list with row index added

        const indexedItems = item_api_data.map((obj, row) => ({
          ...obj,
          row,
        }));

        setItemAPIData(indexedItems);

        localStorage.setItem("ITEM_API_DATA", JSON.stringify(indexedItems));

        setAPILoading(false);
      })
      .catch((error) => {
        setAPILoading(false);
        console.error(error);
        process.env.NODE_ENV === "development" &&
          alert("REPORT IT ->[STOCK - PAGE.JS - 103]\n" + error);
      });
  };

  const checkLocalStorageSaved = (address, manager) => {
    let storage = localStorage.getItem(address);
    if (storage !== null && storage != undefined) {
      storage = JSON.parse(storage);
      manager(storage);
    }
  };

  const downloadSheet = () => {
    if (ExcelContent.length === 0) {
      handleModalMessage({
        name: "message",
        value: `⚠ Add one document before exporting excel.`,
      });
      window.stockModal_1.showModal();
      return;
    }

    let content = [];

    ExcelContent.forEach((d) => {
      content.push(d);
    });

    let data = [
      {
        sheet: "Sheet1",
        columns: [
          { label: "DATE", value: "date" },
          { label: "ITEM NAME", value: "item_name" },
          { label: "QTY", value: "qty", format: "0.00" },
          { label: "MRP", value: "mrp", format: "0.00" },
          { label: "PURC PRICE", value: "purc_price", format: "0.00" },
          { label: "LOCATION", value: "location" },
        ],
        content,
      },
    ];

    exportExcel(data);
  };

  const exportExcel = (data) => {
    const settings = {
      fileName: `STOCK_${formData?.item?.toUpperCase()}_${new Date().getTime()}`,
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    const callback = () => {
      handleModalMessage({
        name: "message",
        value: `✔ Exporting excel successful.`,
      });
      window.stockModal_1.showModal();

      uploadStock(data);
    };

    xlsx(data, settings, callback);
  };

  const addContent = () => {
    // if (!isFormValidated(formData)) return;

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

    const tempContent = {
      date: convertToDateString(formData?.stockDate),
      item_name: formData?.item,
      qty: formData?.quantity,
      mrp: parseFloat(formData?.mrp),
      purc_price: parseFloat(formData?.purc_price),
      location: formData?.location,
    };

    setExcelContent((prevArray) => [...prevArray, tempContent]);

    isMrpMismatched(formData?.selectedItemRow, formData?.mrp); // * update the mrp field if any changes happened in the mrp field.

    handleModalMessage({
      name: "message",
      value: `✔ Item added successfully.`,
    });
    window.stockModal_1.showModal();
  };

  // * update the mrp field if any changes happened in the mrp field.

  const isMrpMismatched = (row, newMrp) => {
    // Find the object with the specified row number
    var obj = ItemAPIData[parseInt(row)];

    // Check if the object was found and if the new MRP value is different from the previous MRP value
    if (obj && obj.mrp != newMrp) {
      updateMrp(row, newMrp);
    }
  };

  const updateMrp = async (row, mrp) => {
    const payload = {
      updateRow: parseInt(row) + 2,
      mrp,
    };

    try {
      const response = await uploadItem(payload);

      if (response === "200") {
        console.log("MRP UPDATED");
      } else {
        console.log("MRP NOT UPDATED");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadStock = async (data) => {
    try {
      const options = {
        caches: "no-cache",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheetdata: JSON.stringify(data),
          items: data[0]?.content?.length,
          desc: "STOCK",
        }),
      };

      const response = await fetch("/api/stock", options);
      const responseData = await response.json();

      if (response?.status === 200) {
        handleModalMessage({
          name: "message",
          value: `✔ Stock added successfully.`,
        });
        window.stockModal_1.showModal();
      } else {
        handleModalMessage({
          name: "message",
          value: `❌ Error: ${responseData?.message}`,
        });
        window.stockModal_1.showModal();
      }
    } catch (error) {
      console.log(error);
      handleModalMessage({
        name: "message",
        value: `❌ Error: while uploading stock.`,
      });
      window.stockModal_1.showModal();
    }
  };

  // ****
  return (
    <>
      <dialog id="stockModal_1" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Message!</h3>
          <p className="py-4">{modalMessage?.message}</p>
          <div className="modal-action">
            <button className="btn">Close</button>
          </div>
        </form>
      </dialog>

      {/* Confirmation dialog */}

      <dialog id="stockModal_2" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Confirmation ?</h3>
          <p className="py-4 text-warning">Press "OK" to add the item.</p>
          <div className="text-white">
            <b className="block mb-2 text-warning">Summary: </b>
            <p>ITEM: {formData?.item}</p>
            <p>MRP: {formData?.mrp}</p>
            <p>QTY: {formData?.quantity}</p>
            <p>PURC PRICE: {formData?.purc_price}</p>
            <p>LOC: {formData?.location}</p>
          </div>
          <div className="modal-action">
            <button className="btn btn-success">Edit</button>
            <button onClick={addContent} className="btn btn-error">
              Ok
            </button>
          </div>
        </form>
      </dialog>

      {/* Alert  */}

      <p className="glass text-center text-[40px] font-mono mb-9 m-auto rounded-xl w-[98%] text-white">
        STOCK MODULE
      </p>
      <div className="text-center">
        {APILoading && (
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        )}
      </div>

      <div className="flex justify-center items-center flex-wrap">
        <DatePicker
          className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
          placeholderText="STOCK DATE"
          showPopperArrow={true}
          maxDate={new Date()}
          selected={formData?.stockDate ?? new Date()}
          onChange={(selectedDate) => {
            handleChange({
              target: {
                name: "stockDate",
                value: selectedDate,
              },
            });
          }}
        />
      </div>

      <p className="text-center m-5 glass rounded-sm">{qrResult}</p>

      <Select
        placeholder="SELECT ITEM/PART NO"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={ItemAPIData}
        getOptionLabel={(option) => `${option["value"]}`}
        value={formData?.item && { value: formData?.item }}
        onChange={(e) => {
          handleChange({ target: { name: "mrp", value: e?.mrp || null } });
          handleChange({ target: { name: "item", value: e?.value } });
          handleChange({ target: { name: "selectedItemRow", value: e?.row } });
          handleChange({ target: { name: "location", value: e?.loc } });
          if (formData?.seriesType === "MAIN") return;
          handleChange({
            target: { name: "gstAmount", value: e?.gst || null },
          });
        }}
        filterOption={createFilter({ ignoreAccents: false })}
        components={{ Option: CustomOption, MenuList: CustomMenuList }}
      />
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="QUANTITY"
          type="number"
          name="quantity"
          value={formData?.quantity || ""}
          onChange={handleChange}
          onWheel={(e) => {
            e.target.blur();
          }}
        />
      </div>

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
          placeholder="PURC PRICE"
          type="number"
          onChange={(e) => {
            handleChange(e);
          }}
          value={formData?.purc_price || ""}
          name="purc_price"
          onWheel={(e) => {
            e.target.blur();
          }}
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="LOCATION"
          type="text"
          onChange={(e) => {
            handleChange(e);
          }}
          value={formData?.location || ""}
          name="location"
        />
      </div>

      <div className="py-20"></div>

      {/* Bottom Nav Bar */}

      <div className="btm-nav glass bg-blue-800">
        <button
          onClick={downloadSheet}
          className=" text-white hover:bg-blue-900"
        >
          <Image
            src="/assets/images/download (1).png"
            width={50}
            height={50}
            alt="icon"
          ></Image>
          <span className="mb-6 text-xl font-mono">Download</span>
        </button>
        <button
          onClick={() => {
            if (isFormValidated(formData)) window.stockModal_2.showModal();
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
            setFormData({
              stockDate: new Date(), // default today.
              item: null,
              quantity: null,
              mrp: null,
              location: null,
              purc_price: null,
              selectedItemRow: -1,
            });

            setExcelContent([]);
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
