"use client";

import React, { useEffect, useState } from "react";
import xlsx from "json-as-xlsx";

const Page = () => {
  const [SavedData, setSavedData] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [FilteredContent, setFilteredContent] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    getSavedData();
  }, []);

  const handleSearch = (e) => {
    if (e.target.value !== "") {
      // setSearchInput(e.target.value);
      const filteredResult = SavedData.filter((document) => {
        return Object.values(document)
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
      const response = await fetch("/api/stock");
      const data = await response.json();
      console.log(data);
      setSavedData(data);
      setFilteredContent(data);
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

    fetch("/api/stock", options)
      .then((response) => {
        if (response.status === 200) {
          alert("🗑 Document has been deleted.");
          getSavedData();
        }
      })
      .catch((err) => console.error(err));
  };

  const multipleDelete = async () => {
    setDeleting(true);
    selectedDocuments.forEach(async (id, index) => {
      const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: id,
        }),
      };

      try {
        const response = await fetch("/api/stock", options);
        if (response.status === 200) {
          handleSelect(id);
        }
        if (selectedDocuments.length - 1 === index) {
          setDeleting(false);
          getSavedData();
        }
      } catch (error) {
        console.log(error);
      }
    });

    // * refresh the Array
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

  const DownloadExcel = (data) => {
    if (data?.length === 0 || !data) return;
    const settings = {
      fileName: data[0].content[0].fileName,
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    xlsx(data, settings);
  };

  const handleSelect = (id) => {
    setSelectedDocuments((prevArray) => {
      if (prevArray.includes(id)) {
        return prevArray.filter((item) => item !== id);
      } else {
        return [...prevArray, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === FilteredContent.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(FilteredContent.map((d) => d._id));
    }
  };

  const containsElement = (array, element) => {
    return array.includes(element) ? "checked" : "";
  };
  return (
    <div>
      <div className="text-center pb-10">
        <p className="text-3xl">STOCK HISTORY</p>
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
            placeholder="🔍 stock.."
          />
        )}
      </div>

      {selectedDocuments?.length > 1 && (
        <div className="alert m-auto w-[90%] ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Delete all the selected documents ? </span>
          <div>
            <button
              onClick={() => setSelectedDocuments([])}
              className="btn btn-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSelectAll()}
              className="btn btn-sm btn-secondary m-2"
            >
              Select all
            </button>
            <button onClick={multipleDelete} className="btn btn-sm btn-primary">
              {deleting ? (
                <span className="loading  loading-spinner loading-xs"></span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      )}

      {Loading ? (
        <div className="text-center">
          <span className="loading loading-infinity w-[80px] text-sky-500"></span>
        </div>
      ) : (
        <div>
          {!Loading && FilteredContent?.length === 0 && (
            <p className="text-center">No data found.</p>
          )}
          {SavedData &&
            FilteredContent?.map((d, i) => {
              return (
                <div key={i} className="bg-sky-800 mx-5 my-12 rounded-xl">
                  <div className="flex p-4 bg-black rounded-t-xl justify-between">
                    <input
                      onChange={() => handleSelect(d._id)}
                      type="checkbox"
                      checked={containsElement(selectedDocuments, d._id)}
                      className="checkbox border-yellow-400"
                    />{" "}
                    <p className="inline">
                      {timeStampConvert(d.createdAt)?.toLocaleUpperCase()}
                    </p>
                  </div>
                  <div className="flex justify-center flex-row flex-wrap">
                    <button className="btn btn-accent m-1 hover:cursor-default">
                      {d?.desc}
                    </button>
                    <button className="btn btn-neutral m-1 hover:cursor-default">
                      Items: {d?.items}
                    </button>
                  </div>

                  <div className="flex justify-center h-10 bg-slate-300 rounded-b-xl">
                    <button
                      onClick={() => {
                        if (confirm(`Do you want to delete ?`)) {
                          deleteDocument(d._id);
                        }
                      }}
                      className="btn btn-error m-5"
                    >
                      DELETE 🗑
                    </button>
                    <button
                      onClick={() => {
                        DownloadExcel(JSON.parse(d?.sheetdata || "[]"));
                        DownloadExcel(
                          JSON.parse(d?.RStockPositiveSheet || "[]")
                        );
                        DownloadExcel(
                          JSON.parse(d?.RStockNegativeSheet || "[]")
                        );
                        DownloadExcel(JSON.parse(d?.RackChangeSheet || "[]"));
                      }}
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
