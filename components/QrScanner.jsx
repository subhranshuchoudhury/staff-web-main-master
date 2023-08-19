"use client";

import React, { useState } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";

export default function MyQrScanner(props) {
  const qrResultHandler = props.qrResultHandler;
  // const [qrResult, setQrResult] = useState("");
  const [counter, setCounter] = useState(0);
  return (
    <QrScanner
      tracker={false}
      hideCount={false}
      onDecode={(result) => {
        console.log(result);
        qrResultHandler(result);
        setCounter(counter + 1);
      }}
      onError={(error) => console.log(error)}
      constraints={{ facingMode: "environment" }}
    />
  );
}
