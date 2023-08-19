"use client";

import React, { useState } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";

export default function page() {
  const [qrResult, setQrResult] = useState("");
  const [counter, setCounter] = useState(0);
  return (
    <div>
      <p>
        Result: {qrResult} Counter: {counter}
      </p>
      <div className="p-10 m-auto">
        <QrScanner
          tracker={true}
          hideCount={false}
          onDecode={(result) => {
            setQrResult(result);
            setCounter(counter + 1);
          }}
          onError={(error) => alert(JSON.stringify(error))}
          constraints={{ facingMode: "environment" }}
        />
      </div>
    </div>
  );
}
