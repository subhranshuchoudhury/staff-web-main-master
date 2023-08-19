"use client";

import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function page() {
  const [data, setData] = useState("Not Found");

  return (
    <>
      <p>{data}</p>
      <BarcodeScannerComponent
        width={500}
        height={500}
        onUpdate={(err, result) => {
          if (result) setData(result.text);
          else setData("Not Found");
        }}
      />
    </>
  );
}
