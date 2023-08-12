"use client";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Select, { createFilter } from "react-select";
// import partyname from "../DB/Purchase/partyname";
// import Itemgroup from "../DB/Purchase/Itemgroup";
import saletype from "../DB/Sale/saletype";
import seriesType from "../DB/Sale/seriestype";
import Image from "next/image";
import unitypes from "../DB/Purchase/unitypes";
import { useEffect, useState } from "react";
import CustomOption from "../Dropdown/CustomOption";
import CustomMenuList from "../Dropdown/CustomMenuList";

export default function Home() {
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
    totalAmount: null,
  });

  const [PartyAPIData, setPartyAPIData] = useState([]);
  const [ItemAPIData, setItemAPIData] = useState([]);
  const [APILoading, setAPILoading] = useState(true);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = () => {
    validateForm(formData) && alert(JSON.stringify(formData));
    // action
  };

  const validateForm = (form) => {
    for (let key in form) {
      if (form[key] === null || form[key] === undefined || form[key] === "") {
        alert(
          `The field "${key
            .replace(/[A-Z]/g, (match) => " " + match)
            .trim()
            .toUpperCase()}" is empty.`
        );
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

        setPartyAPIData(party_api_data);
        setItemAPIData(item_api_data);

        localStorage.setItem("ITEM_API_DATA", JSON.stringify(item_api_data));
        localStorage.setItem("PARTY_API_DATA", JSON.stringify(party_api_data));

        setAPILoading(false);
      })
      .catch((error) => {
        setAPILoading(false);
        console.error(error);
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

  // ****
  return (
    <>
      <p className="glass text-center text-[40px] font-mono mb-9 m-auto rounded-xl w-[98%] text-red-600">
        SALE (NOT READY)
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
        }}
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
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="VEHICLE NO"
          type="number"
          name="vehicleNo"
          onChange={handleChange}
          value={formData?.vehicleNo || ""}
          onWheel={(e) => {
            e.target.blur();
          }}
        />
      </div>
      <Select
        placeholder="SELECT ITEM"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={ItemAPIData}
        getOptionLabel={(option) => `${option["value"]}`}
        value={formData?.item && { value: formData?.item }}
        onChange={(e) => {
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
          value={formData?.discAmount || ""}
          name="discAmount"
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
        <button className=" text-white hover:bg-blue-900">
          <Image
            src="/assets/images/download (1).png"
            width={50}
            height={50}
            alt="icon"
          ></Image>
          <span className="mb-6 text-xl font-mono">Download</span>
        </button>
        <button onClick={handleSubmit} className="text-white hover:bg-blue-900">
          <Image
            className="mb-20"
            src="/assets/images/add-button.png"
            width={70}
            height={70}
            alt="icon"
          ></Image>
        </button>
        <button className="text-white hover:bg-blue-900">
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
