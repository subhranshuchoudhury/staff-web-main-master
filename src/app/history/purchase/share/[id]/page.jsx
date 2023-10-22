"use client";

import xlsx from "json-as-xlsx";
import React, { useEffect, useState } from "react";

export default function Page(props) {
  const [autoDownloadDetails, setAutoDownloadDetails] = useState({
    type: "",
    download: "",
    id: "",
  });
  const [LoadedWeb, setLoadedWeb] = useState(false);
  const [FileData, setFileData] = useState([]);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    setLoadedWeb(true);
    const demo = {
      params: {
        id: "6534cfb6f63ca5a5e3d95606",
      },
      searchParams: {
        type: "purchase?download=1",
      },
    };
    const id = props.params.id;
    const type = props.searchParams.type;
    const download = props.searchParams.download;

    setAutoDownloadDetails({ type, download, id });

    getFileData(id);
  }, []);

  const getFileData = async (id) => {
    const url = `/api/purchases/id?id=${id}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setFileData(data?.purchases);
      console.log(JSON.parse(data?.purchases?.[0]?.sheetdata));
      if (props.searchParams.download === "1") {
        DownloadExcel(
          data?.purchases?.[0]?.partyname,
          data?.purchases?.[0]?.invoice,
          JSON.parse(data?.purchases?.[0]?.sheetdata)
        );
      }
    } catch (error) {
      console.error(error);
    }
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
      setIsDownloaded(true);
    };
    xlsx(data, settings, callback);
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col space-y-7">
      <p className="font-bold text-xl mb-3 text-green-500">Purchase History</p>

      <div className="overflow-x-scroll">
        {LoadedWeb && (
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Party Name</th>
                <th>Invoice</th>
                <th>Total Items</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {FileData?.length > 0
                ? FileData.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.partyname}</td>
                        <td>{item.invoice}</td>
                        <td>{item.items}</td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        )}
      </div>
      {autoDownloadDetails?.download === "1" ? (
        <div className="animate-pulse text-yellow-400">
          {isDownloaded
            ? "✅File Downloaded"
            : "Downloading File, Please Wait..."}
        </div>
      ) : (
        <div
          onClick={() => {
            FileData?.length > 0 &&
              DownloadExcel(
                FileData?.[0]?.partyname,
                FileData?.[0]?.invoice,
                JSON.parse(FileData?.[0]?.sheetdata)
              );
          }}
          className="animate-pulse bg-blue-600 p-3 rounded-md hover:cursor-pointer"
        >
          Download
        </div>
      )}
      {FileData?.length === 0 ? (
        <span className="loading loading-spinner  text-accent"></span>
      ) : null}
    </div>
  );
}
