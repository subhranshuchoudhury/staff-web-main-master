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
  useEffect(() => {
    getAPIContent();
  }, []);

  const [formData, setFormData] = useState({
    user: null,
    stockDate: new Date(),
    item: null,
    quantity: null,
    location: null,
    purc_price: null,
    computerStock: null,
    physicalStock: null,
    selectedItemRow: -1,
  });

  const [modalMessage, setModalMessage] = useState({
    message: null,
  });

  const [ItemAPIData, setItemAPIData] = useState([]);
  const [APILoading, setAPILoading] = useState(true);
  const [ExcelContent, setExcelContent] = useState([]);

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
        if (key === "purc_price") {
          form[key] = 0;
          continue;
        }
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
    Promise.all([fetch("/api/items")])
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((data) => {
        const item_api_data = data[0];

        // demo of response

        // const demoData = {
        //   _id: "669f819df84e0c9fd7551e42",
        //   code: 11574,
        //   itemName: "29066277-CMC ASSY SFC609/709",
        //   partNumber: "29066277",
        //   groupName: "BRAKES INDIA LTD",
        //   unitName: "Pcs",
        //   gstPercentage: "28%",
        //   storageLocation: "BIN-2A/1/3",
        //   closingStock: 1,
        //   unitPrice: null,
        //   unitPriceAfterDiscount: null,
        //   __v: 0,
        //   discPercentage: 0,
        //   mrp: 1350,
        // };

        setItemAPIData(item_api_data);

        console.log("ITEM_API_DATA", item_api_data);

        setAPILoading(false);
      })
      .catch((error) => {
        setAPILoading(false);
        console.error(error);
        process.env.NODE_ENV === "development" &&
          alert("REPORT IT ->[STOCK - PAGE.JS - 103]\n" + error);
      });
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
          { label: "PURC PRICE", value: "purc_price", format: "0.00" },
          { label: "LOCATION", value: "location" },
        ],
        content,
      },
    ];

    exportExcel(data);
  };

  const exportExcel = (data, fileName, callBack) => {
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

    const physicalStock = parseFloat(formData?.physicalStock || 0);
    const computerStock = parseFloat(formData?.computerStock || 0);

    if (physicalStock > computerStock) {
      alert("Physical stock is greater than computer stock.");
    } else if (physicalStock < computerStock) {
      alert("Physical stock is less than computer stock.");
    }

    return; // temporary test

    const tempContent = {
      date: convertToDateString(formData?.stockDate),
      item_name: formData?.item,
      qty: formData?.quantity,
      purc_price: parseFloat(formData?.purc_price || 0),
      location: formData?.location,
    };

    setExcelContent((prevArray) => [...prevArray, tempContent]);

    handleModalMessage({
      name: "message",
      value: `✔ Item added successfully.`,
    });
    window.stockModal_1.showModal();
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
            {/* <p>MRP: {formData?.mrp}</p> */}
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

      <p className="text-center text-[40px] font-bold underline mb-24 m-auto rounded-xl w-[98%] text-white">
        STOCK MODULE
      </p>
      <div className="text-center">
        {APILoading && (
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        )}
      </div>

      <div className="flex justify-center items-center flex-wrap">
        <div className="flex justify-center items-center flex-wrap">
          <input
            className="input input-bordered input-secondary w-[295px] m-5"
            placeholder="User"
            type="text"
            name="user"
            value={formData?.user || ""}
            onChange={handleChange}
          />
        </div>
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

      {/* <p className="text-center m-5 glass rounded-sm">{qrResult}</p> */}

      <Select
        placeholder="Select Item"
        className="w-[95%] m-auto p-5 text-blue-800 font-bold"
        options={ItemAPIData}
        getOptionLabel={(option) => `${option["itemName"]}`}
        value={formData?.item && { itemName: formData?.item }}
        onChange={(e) => {
          handleChange({ target: { name: "item", value: e?.itemName } });
          handleChange({
            target: { name: "computerStock", value: e?.closingStock },
          });
          handleChange({ target: { name: "selectedItemRow", value: e?._id } });
          handleChange({
            target: { name: "location", value: e?.storageLocation },
          });
          if (formData?.seriesType === "MAIN") return;
          handleChange({
            target: { name: "gstAmount", value: e?.gstPercentage || null },
          });
        }}
        filterOption={createFilter({ ignoreAccents: false })}
        components={{ Option: CustomOption, MenuList: CustomMenuList }}
      />
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="Quantity"
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
          placeholder="Physical Stock"
          type="text"
          onChange={(e) => {
            handleChange(e);
          }}
          value={formData?.physicalStock || ""}
          name="physicalStock"
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="Computer Stock"
          type="number"
          onChange={(e) => {
            handleChange(e);
          }}
          value={formData?.computerStock || ""}
          name="computerStock"
          onWheel={(e) => {
            e.target.blur();
          }}
        />
      </div>

      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="Purchase Price"
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
          placeholder="Location"
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
