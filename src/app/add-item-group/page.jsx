"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { postItemGroup } from "../AppScript/script";

export default function page() {
  const [GroupData, setGroupData] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [inputData, setInputData] = useState("");
  const uploadGroup = async () => {
    if (inputData === "") {
      toast.error("Please enter group name");
      return;
    }
    setLoading(true);
    try {
      const response = await postItemGroup(inputData);
      console.log(response);
      if (response === "200") {
        toast.success("Group added successfully");
        getTheList();
        setInputData("");
      } else {
        toast.error("Something went wrong");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  const getTheList = async () => {
    setLoading(true);
    const savedData = JSON.parse(localStorage.getItem("GROUP_DATA") || "[]");
    setGroupData(savedData);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxmPVf5TSB83HA_CPj8Eu6vHKEAVHk25ufoNQmrvsetWqQUCCRuSPXEm4vbLCrUtBwP/exec"
      );
      if (response.status === 200) {
        const data = await response.json();

        setGroupData(data);

        // * save in local storage

        localStorage.setItem("GROUP_DATA", JSON.stringify(data));
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    getTheList();
  }, []);

  return (
    <div>
      <Toaster />
      <p className="text-center text-2xl font-bold">ADD ITEM GROUP</p>

      <div className="flex justify-center">
        <div className="mt-10 flex justify-center items-center flex-row flex-wrap">
          <input
            type="text"
            onChange={(e) => setInputData(e.target.value)}
            value={inputData}
            placeholder="Enter group name..."
            className="input input-bordered input-secondary w-[295px] m-5"
          />

          <button
            onClick={uploadGroup}
            className="bg-blue-600 h-11 p-3 rounded-lg uppercase"
          >
            Submit
          </button>
        </div>
      </div>
      <div className="text-center">
        {Loading && (
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        )}
      </div>

      <div className="flex justify-center h-96 mt-10 overflow-scroll overflow-x-hidden">
        <div className="mt-10">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Group SL</th>
                <th>Group Name</th>
              </tr>
            </thead>
            <tbody>
              {GroupData.map((item, index) => {
                return (
                  <tr
                    className="hover:bg-cyan-500 hover:cursor-not-allowed"
                    key={index}
                  >
                    <td>{index + 1}</td>

                    <td>{item.value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
