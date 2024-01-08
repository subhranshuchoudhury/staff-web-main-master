"use client";

import React, { useEffect, useState } from "react";
import xlsx from "json-as-xlsx";
import toast, { Toaster } from "react-hot-toast";

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
      const response = await fetch("/api/purchases");
      const data = await response.json();
      setSavedData(data?.purchases);
      setFilteredContent(data?.purchases);
      setLoading(false);
    } catch (error) {
      toast.error("error while fetching saved data");
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
          toast.success("🗑 Document has been deleted.");
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
        const response = await fetch("/api/purchases", options);
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

  const DownloadExcel = (fileName, invoice, data) => {
    const settings = {
      fileName: `${fileName}-${invoice?.split("-")[1] || invoice}`,
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };
    let callback = function () {
      toast.success("✔ Download Successful!");
    };
    xlsx(data, settings, callback);
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

  const addInDownloadedList = (id) => {
    if (!checkIsAlreadyDownload(id)) {
      const localDownloadedList = localStorage.getItem("ADI");

      if (localDownloadedList === null || localDownloadedList === undefined) {
        localStorage.setItem("ADI", JSON.stringify([{ id: id }]))
      } else {
        let parsedList = JSON.parse(localDownloadedList) | [];
        parsedList.push({ id: id });
        localStorage.setItem("ADI", JSON.stringify(parsedList));
      }
    }
  }

  const checkIsAlreadyDownload = (id) => {
    const localDownloadedList = localStorage.getItem("ADI");

    if (localDownloadedList === null || localDownloadedList === undefined) {
      return false;
    } else {
      const parsedList = JSON.parse(localDownloadedList)
      const isPresent = parsedList.find((item) => item.id === id);
      return isPresent ? true : false;

    }
  }
  return (
    <div>
      <Toaster />
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
            placeholder="🔍 eg. INV-XXX, AB ENTERPRISES.."
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
                      onClick={() => handleSelect(d._id)}
                      type="checkbox"
                      checked={containsElement(selectedDocuments, d._id)}
                      className="checkbox border-yellow-400"
                    />{" "}
                    <p className="inline">
                      {timeStampConvert(d.createdAt)?.toLocaleUpperCase()}
                    </p>
                  </div>
                  <div className="flex justify-center flex-row flex-wrap">
                    {
                      checkIsAlreadyDownload(d._id) && <button className="btn btn-error animate-pulse m-1 hover:cursor-default">
                        Downloaded
                      </button>
                    }
                    <button className="btn btn-accent m-1 hover:cursor-default">
                      {d?.desc}
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
                    <button className="btn btn-neutral m-1 hover:cursor-default">
                      TOTAL AMOUNT:{" "}
                      {JSON.parse(d?.sheetdata)[0].content[0].BILL_REF_AMOUNT}
                    </button>
                  </div>

                  <div className="flex justify-center h-10 bg-slate-300 rounded-b-xl">
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
                      onClick={() => {
                        DownloadExcel(
                          d?.partyname,
                          d?.invoice,
                          JSON.parse(d?.sheetdata)
                        );

                        addInDownloadedList(d._id);
                      }


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
