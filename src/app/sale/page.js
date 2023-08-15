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

export default function Page() {
  // ****

  useEffect(() => {
    getAPIContent();
  }, []);

  const [formData, setFormData] = useState({
    seriesType: null,
    saleDate: new Date(), // default today.
    saleType: null,
    partyName: null,
    vehicleNo: null,
    item: null,
    quantity: null,
    unitType: null,
    mrp: null,
    disc: null,
    discAmount: null,
    gstAmount: null,
    totalAmount: null,
  });

  const [modalMessage, setModalMessage] = useState({
    message: null,
    summary: null,
    edit: null,
    ok: null,
  });

  const [PartyAPIData, setPartyAPIData] = useState([]);
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

  // API CALLS

  const getAPIContent = async () => {
    // check for local storage (fast loading)
    checkLocalStorageSaved("PARTY_API_DATA", setPartyAPIData);
    checkLocalStorageSaved("ITEM_API_DATA", setItemAPIData);

    // calls apis simultaneously

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
        const item_api_data = data[0];
        const party_api_data = data[1];

        // item list with row index added

        const indexedItems = item_api_data.map((obj, row) => ({
          ...obj,
          row,
        }));

        setPartyAPIData(party_api_data);
        setItemAPIData(indexedItems);

        localStorage.setItem("PARTY_API_DATA", JSON.stringify(party_api_data));
        localStorage.setItem("ITEM_API_DATA", JSON.stringify(indexedItems));

        setAPILoading(false);
      })
      .catch((error) => {
        setAPILoading(false);
        console.error(error);
        process.env.NODE_ENV === "development" &&
          alert("REPORT IT ->[SALE - PAGE.JS - 103]\n" + error);
      });
  };

  const checkLocalStorageSaved = (address, manager) => {
    let storage = localStorage.getItem(address);
    if (storage !== null && storage != undefined) {
      storage = JSON.parse(storage);
      manager(storage);
    }
  };

  const calculateDisc = (disc) => {
    if (!disc || !formData?.mrp) return;

    const mrp = formData?.mrp;

    // console.log(mrp, disc);

    const discAmount = (mrp * disc) / 100;

    handleChange({
      target: {
        name: "discAmount",
        value: Number(discAmount.toFixed(2)),
      },
    });
    handleChange({
      target: {
        name: "totalAmount",
        value: mrp - discAmount,
      },
    });
  };

  const adjustDisc = (discAmount) => {
    if (!formData?.mrp || !formData?.discAmount) return;
    const disc = (discAmount / formData?.mrp) * 100;
    // console.log(disc);
    handleChange({
      target: {
        name: "disc",
        value: Number(disc.toFixed(2)),
      },
    });

    handleChange({
      target: {
        name: "totalAmount",

        value: formData?.mrp - discAmount,
      },
    });
  };

  const downloadSheet = () => {
    if (ExcelContent.length === 0) {
      handleModalMessage({
        name: "message",
        value: `⚠ Add one document before exporting excel.`,
      });
      window.saleModal_1.showModal();
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
    exportExcel(data);
  };

  const exportExcel = (data) => {
    const settings = {
      fileName: `${formData?.vehicleNo?.toUpperCase()}_${new Date().getTime()}`,
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
      window.saleModal_1.showModal();
    };

    xlsx(data, settings, callback);
  };

  const addContent = () => {
    if (!isFormValidated(formData)) return;

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
      const igstPer = parseFloat(formData?.gstAmount);
      const discPer = parseFloat(formData?.disc);
      const deno = igstPer / 100;
      const num = discPer + igstPer;
      const result = num / (deno + 1);
      return result;
    };

    const tempContent = {
      vchSeries: formData?.seriesType,
      billDate: convertToDateString(formData?.saleDate),
      saleType: formData?.saleType,
      partyName: formData?.partyName,
      narration: formData?.vehicleNo?.toUpperCase(),
      itemName: formData?.item,
      qty: formData?.quantity,
      unit: formData?.unitType,
      price: formData?.mrp,
      disc: discPercent(),
      amount: Math.round(formData?.totalAmount * formData?.quantity),
      igstPercent: formData?.gstAmount,
      cgst: formData?.gstAmount / 2,
      sgst: formData?.gstAmount / 2,
    };

    setExcelContent((prevArray) => [...prevArray, tempContent]);

    handleModalMessage({
      name: "message",
      value: `✔ Item added successfully.`,
    });
    window.saleModal_1.showModal();
  };

  // ****
  return (
    <>
      <dialog id="saleModal_1" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Message!</h3>
          <p className="py-4">{modalMessage?.message}</p>
          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn">Close</button>
          </div>
        </form>
      </dialog>
      <p className="glass text-center text-[40px] font-mono mb-9 m-auto rounded-xl w-[98%] text-red-600">
        SALE (Testing Phase)
      </p>
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
          } else if (e?.value === "GST") {
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
      </div>
      <Select
        placeholder="SELECT ITEM"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={ItemAPIData}
        getOptionLabel={(option) => `${option["value"]}`}
        value={formData?.item && { value: formData?.item }}
        onChange={(e) => {
          console.log(e);
          handleChange({ target: { name: "unitType", value: e?.unit } });
          handleChange({ target: { name: "item", value: e?.value } });
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
        <button onClick={addContent} className="text-white hover:bg-blue-900">
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
              seriesType: null,
              saleDate: new Date(), // default today.
              saleType: null,
              partyName: null,
              vehicleNo: null,
              item: null,
              quantity: null,
              unitType: null,
              mrp: null,
              disc: null,
              discAmount: null,
              gstAmount: null,
              totalAmount: null,
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
