"use client";

import React, { useState } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";

export default function MyQrScanner(props) {
  const qrResultHandler = props.qrResultHandler;
  // const [qrResult, setQrResult] = useState("");
  return (
    <QrScanner
      tracker={false}
      hideCount={false}
      onDecode={(result) => {
        qrResultHandler(result);
      }}
      onError={(error) => console.log(error)}
      constraints={{
        noiseSuppression: true,
        facingMode: {
          exact: "environment",
        },
        frameRate: {
          ideal: 10,
          max: 15,
        },
        width: {
          min: 500,
          max: 800,
          ideal: 400,
        },
        height: {
          min: 500,
          max: 800,
          ideal: 400,
        },
      }}
    />
  );
}
