"use client";

import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

export default function page() {
  const [data, setData] = useState("No result");

  return (
    <>
      <p>{data}</p>

      <div className="w-72 h-72 m-auto">
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result, error) => {
            if (!!result) {
              setData(result?.text);
            }

            if (!!error) {
              console.info(error);
            }
          }}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}
