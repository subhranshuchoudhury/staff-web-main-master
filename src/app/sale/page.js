"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import partyname from "../DB/Purchase/partyname";
import Itemgroup from "../DB/Purchase/Itemgroup";
import saletype from "../DB/Sale/saletype";
import seriesType from "../DB/Sale/seriestype";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <>
        <p className="glass text-center text-[40px] font-mono mb-9 rounded-xl w-full">
          SALE
        </p>
        <Select
          placeholder="SERIES TYPE"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          options={seriesType}
          getOptionLabel={(option) => `${option["value"]}`}
        />
        <div className="flex justify-center items-center flex-wrap">
          <DatePicker
            className="input input-bordered input-secondary w-[295px] m-5 hover:cursor-pointer"
            isClearable={true}
            placeholderText=" SALE DATE"
          />
        </div>
        <div>
          <Select
            placeholder="SALE TYPE"
            className="w-full m-auto p-5 text-blue-800 font-bold"
            options={saletype}
            getOptionLabel={(option) => `${option["value"]}`}
          />
        </div>
        <Select
          placeholder="PARTY NAME"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          options={partyname}
          getOptionLabel={(option) => `${option["value"]}`}
        />
      </>
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="VEHICLE NO"
          type="number"
        />
      </div>
      <Select
        placeholder="ITEM NAME"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        options={Itemgroup}
        getOptionLabel={(option) => `${option["value"]}`}
      />
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="QUANTITY"
          type="number"
        />
      </div>
      <Select
        placeholder="UNIT"
        className="w-full m-auto p-5 text-blue-800 font-bold"
        // options={}
      />
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="MRP"
          type="number"
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="DISC %"
          type="number"
        />
      </div>
      <div className="flex justify-center items-center flex-wrap">
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="DISC AMOUNT"
          type="number"
        />
        <input
          className="input input-bordered input-secondary w-[295px] m-5"
          placeholder="TOTAL AMOUNT"
          type="number"
        />
      </div>
      <div className="py-20"></div>
      {/* Bottom Nav Bar */}
      <div className="btm-nav glass bg-blue-800">
        <button className=" text-white hover:bg-blue-900">
          <Image
            className=""
            src="/assets/images/download (1).png"
            width={50}
            height={50}
            alt="icon"
          ></Image>
          <span className="mb-6 text-xl font-mono">Download</span>
        </button>
        <button className="text-white hover:bg-blue-900">
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
