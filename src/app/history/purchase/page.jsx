"use client";

import React, { useEffect, useState } from "react";
import xlsx from "json-as-xlsx";

const Page = () => {
  const [SavedData, setSavedData] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [FilteredContent, setFilteredContent] = useState([]);

  useEffect(() => {
    getSavedData();
  }, []);

  const handleSearch = (e) => {
    if (e.target.value !== "") {
      // setSearchInput(e.target.value);
      const filteredResult = SavedData.filter((movie) => {
        return Object.values(movie)
          .join(" ")
          .toLowerCase()
          .includes(e.target.value?.toLowerCase());
      });
      setFilteredContent(filteredResult);
    } else {
      setFilteredContent(SavedData);
    }
  };

  const getSavedData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/purchases");
      const data = await response.json();
      console.log(typeof data);
      setSavedData(data?.purchases);
      setFilteredContent(data?.purchases);
      console.log(data);
      setLoading(false);
    } catch (error) {
      alert("error while fetching saved data");
      setLoading(false);
    }
  };

  const deleteDocument = (id) => {
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: id,
      }),
    };

    fetch("/api/purchases", options)
      .then((response) => {
        if (response.status === 200) {
          alert("✔ Document has been deleted!");
          getSavedData();
        }
      })
      .catch((err) => console.error(err));
  };

  const timeStampConvert = (oldDate) => {
    const date = new Date(oldDate);
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const indianTime = new Intl.DateTimeFormat("en-US", options).format(date);
    return indianTime;
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
      alert("✔ Download Successful!");
    };
    xlsx(data, settings, callback);
  };
  return (
    <div>
      <div className="text-center pb-10">
        <p className="text-3xl">PURCHASE HISTORY</p>
        {!Loading && (
          <input
            className="input input-bordered input-secondary m-5 normal-case w-[295px]"
            type="text"
            name="searchInput"
            id=""
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e?.target?.value);
              handleSearch(e);
            }}
            placeholder="🔍 eg. INV-56, AB ENTERPRISES.."
          />
        )}
      </div>

      {Loading ? (
        <div className="text-center">
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        </div>
      ) : (
        <div>
          {SavedData &&
            FilteredContent?.map((d, i) => {
              return (
                <div
                  key={i}
                  className="bg-sky-800 m-10 w-[90%] rounded-xl text-center"
                >
                  <div className="p-4 bg-black rounded-t-xl">
                    {timeStampConvert(d.createdAt)?.toLocaleUpperCase()}
                  </div>
                  <button className="btn btn-accent m-1 hover:cursor-default">
                    {d?.desc || "PURCHASE"}
                  </button>
                  <button className="btn btn-neutral m-1 hover:cursor-default">
                    Items: {d?.items}
                  </button>
                  <button className="btn btn-neutral m-1 hover:cursor-default">
                    INVOICE: {d?.invoice}
                  </button>
                  <button className="btn btn-neutral m-1 hover:cursor-default">
                    PARTY: {d?.partyname}
                  </button>
                  <br />
                  <div className="text-right h-10 bg-slate-300 rounded-b-xl">
                    <button
                      onClick={() => {
                        if (
                          confirm(`Do you want to delete "${d?.invoice}" ?`)
                        ) {
                          deleteDocument(d._id);
                        }
                      }}
                      className="btn btn-error m-5"
                    >
                      DELETE 🗑
                    </button>
                    <button
                      onClick={() =>
                        DownloadExcel(
                          d?.partyname,
                          d?.invoice,
                          JSON.parse(d?.sheetdata)
                        )
                      }
                      className="btn bg-green-700 m-5"
                    >
                      Download ⬇
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Page;
