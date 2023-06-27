"use client";

import Image from "next/image";
import React, { useState } from "react";
import Select from "react-select";
import ledgertype from "../DB/ledgertype";
import Grouptype from "../DB/grouptypename";
import states from "../DB/statesnames";
import dealertype from "../DB/dealertype";
import { useRouter } from "next/navigation";
import xlsx from "json-as-xlsx";
import { uploadParty } from "../AppScript/script";

const Page = () => {
  const router = useRouter();
  const [DATA, setData] = useState({
    ACC_NAME: "",
    TYPE_OF_LEDGER: "",
    ACC_GROUP: "",
    ADD_1: "",
    ADD_2: "",
    ACC_COUNTRY: "India",
    ACC_STATE: "",
    TYPE_OF_DEALER: "",
    GST_NO: "",
    ACC_MOB_NO: "",
    ACC_CREDIT_DAYS_PURC: "",
  });
  const [Registered, setRegistered] = useState(true);
  const [Content, setContent] = useState([]);
  const [modalMessage, setModalMessage] = useState({
    message: "",
    title: "",
    btn: "",
  });

  // adding object to the content array

  const addObject = (obj) => {
    setContent((prevArray) => [...prevArray, obj]);
  };

  const pushContent = async () => {
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
      setModalMessage({
        message: "Please wait while we updating party list...",
        title: "Wait ⌛",
      });
      window.my_modal_1.showModal();

      try {
        const response = await uploadParty(DATA.ACC_NAME);
        if (response === "200") {
          addObject(DATA);
          setModalMessage({
            message: "The party has been added in the dropdown and excel.",
            title: "Done ✅",
            btn: "Ok",
          });
        } else {
          throw new Error("error while uploading party data");
        }
      } catch (error) {
        setModalMessage({
          message: "Something went wrong!",
          title: "Error ❌",
          btn: "Ok",
        });
      }
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

    Content.forEach((e) => {
      content.push(e);
    });
    let data = [
      {
        sheet: "Sheet1",
        columns: [
          { label: "ACC_NAME", value: "ACC_NAME" },
          { label: "TYPE_OF_LEDGER", value: "TYPE_OF_LEDGER" },
          { label: "ACC_GROUP", value: "ACC_GROUP" },
          { label: "ADD_1", value: "ADD_1" },
          { label: "ADD_2", value: "ADD_2" },
          { label: "ACC_COUNTRY", value: "ACC_COUNTRY" },
          { label: "ACC_STATE", value: "ACC_STATE" },
          { label: "TYPE_OF_DEALER", value: "TYPE_OF_DEALER" },
          { label: "GST_NO", value: "GST_NO" },
          { label: "ACC_MOB_NO", value: "ACC_MOB_NO", format: "0" },
          {
            label: "ACC_CREDIT_DAYS_PURC",
            value: "ACC_CREDIT_DAYS_PURC",
            format: "0",
          },
        ],
        content,
      },
    ];

    downloadExcel(data);
  };

  const downloadExcel = (data) => {
    const settings = {
      fileName: `NEW PARTY-${new Date().getTime()}`,
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
      router.replace("/");
    };
    xlsx(data, settings, callback);
  };

  return (
    <>
      {/* Open the modal using ID.showModal() method */}

      <dialog id="my_modal_1" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">{modalMessage?.title}</h3>
          <p className="py-2">{modalMessage?.message}</p>

          <div className="modal-action">
            {modalMessage?.btn ? (
              <button className="btn">{modalMessage.btn}</button>
            ) : null}
          </div>
        </form>
      </dialog>
      <div className="m-5">
        <p className="glass text-center text-[40px] font-mono mb-9 rounded-xl w-full">
          ADD PARTY
        </p>
        <Select
          placeholder="LEDGER TYPE"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          options={ledgertype}
          isSearchable={false}
          onChange={(e) => {
            DATA.TYPE_OF_LEDGER = e?.value;
          }}
        />

        <Select
          placeholder="GROUP TYPE"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          options={Grouptype}
          isSearchable={false}
          onChange={(e) => {
            DATA.ACC_GROUP = e?.value;
          }}
        />

        <Select
          placeholder="SELECT STATE"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          getOptionLabel={(option) => `${option["value"]}`}
          options={states}
          onChange={(e) => {
            DATA.ACC_STATE = e?.value;
          }}
        />
        <Select
          placeholder="TYPE OF DEALER"
          className="w-full m-auto p-5 text-blue-800 font-bold"
          getOptionLabel={(option) => `${option["value"]}`}
          options={dealertype}
          isSearchable={false}
          onChange={(e) => {
            if (e?.value === "Registered") {
              setRegistered(true);
            } else {
              setRegistered(false);
              DATA.GST_NO = " ";
            }
            DATA.TYPE_OF_DEALER = e?.value;
          }}
        />
      </div>

      <div className="flex justify-center flex-wrap">
        {/* Acc Name */}
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="NAME OF THE PARTY"
          type="text"
          onChange={(e) => {
            DATA.ACC_NAME = e.target?.value?.toUpperCase();
          }}
        />
        <input
          className="input input-bordered input-secondary w-[320px] m-5 uppercase"
          placeholder="ENTER GST NO"
          type="text"
          disabled={!Registered}
          onChange={(e) => {
            DATA.GST_NO = e.target?.value;
          }}
        />

        <input
          className="input input-bordered input-secondary w-[320px] m-5"
          placeholder="ENTER MOBILE"
          type="number"
          onWheel={(e) => {
            e.target.blur();
          }}
          onChange={(e) => {
            DATA.ACC_MOB_NO = e.target?.value;
          }}
        />

        <input
          className="input input-bordered input-secondary w-[320px] m-5"
          placeholder=" ENTER COUNTRY"
          type="text"
          defaultValue={"India"}
          disabled={true}
        />

        <input
          className="input input-bordered input-secondary w-[320px] m-5"
          placeholder=" ENTER CITY (ADDR-1)"
          type="text"
          onChange={(e) => {
            DATA.ADD_1 = e.target?.value;
          }}
        />
        <input
          className="input input-bordered input-secondary w-[320px] m-5"
          placeholder="ENTER DISTRICT (ADDR-2)"
          type="text"
          onChange={(e) => {
            DATA.ADD_2 = e.target?.value;
          }}
        />
        <input
          className="input input-bordered input-secondary w-[320px] m-5"
          placeholder="ENTER CREDIT DAYS"
          type="number"
          onWheel={(e) => {
            e.target.blur();
          }}
          onChange={(e) => {
            DATA.ACC_CREDIT_DAYS_PURC = e.target?.value;
          }}
        />
      </div>

      <div className="pt-36"></div>
      <div className="btm-nav glass bg-blue-800">
        <button
          onClick={() => {
            createExcelSheet();
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
            src="/assets/images/uploadfile.png"
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
};

export default Page;
