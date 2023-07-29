"use client";

import React, { useEffect, useState } from "react";
import xlsx from "json-as-xlsx";

const Page = () => {
  const [SavedData, setSavedData] = useState([]);
  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedData();
  }, []);

  const getSavedData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/purchases");
      const data = await response.json();
      setSavedData(data);
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
      </div>
      {Loading ? (
        <h1 className="text-center">Loading...</h1>
      ) : (
        <div>
          {SavedData &&
            SavedData?.purchases.map((d, i) => {
              return (
                <div
                  key={i}
                  className="bg-cyan-600 m-10 rounded-xl text-center"
                >
                  <div className="p-4">{timeStampConvert(d.createdAt)}</div>

                  <button className="btn btn-neutral m-5 hover:cursor-default">
                    Total Items: {d?.items}
                  </button>
                  <button className="btn btn-neutral m-5 hover:cursor-default">
                    INVOICE: {d?.invoice}
                  </button>
                  <button className="btn btn-neutral m-5 hover:cursor-default">
                    PARTY: {d?.partyname}
                  </button>
                  <br />
                  <div className="text-right bg-slate-300 rounded-b-xl">
                    <button
                      onClick={() => {
                        // deleteDocument(d?._id);
                        alert(
                          "NOTE: currently this function is not available."
                        );
                      }}
                      className="btn btn-error m-5 hover:cursor-not-allowed"
                    >
                      DELETE
                    </button>
                    <button
                      onClick={() =>
                        DownloadExcel(
                          d?.partyname,
                          d?.invoice,
                          JSON.parse(d?.sheetdata)
                        )
                      }
                      className="btn bg-black m-5"
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
