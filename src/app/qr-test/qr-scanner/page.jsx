"use client";

import React, { useRef } from "react";
import QrScanner from "qr-scanner";
import { useEffect } from "react";
import { useState } from "react";

export default function page() {
  const videoRef = useRef();
  const [result, setresult] = useState("No result yet");

  useEffect(() => {
    const videoElement = videoRef.current;
    const qrScanner = new QrScanner(
      videoElement,
      (scanRes) => console.log("decoded qr code:", setresult(scanRes)),
      {
        /* your options or returnDetailedScanResult: true if you're not specifying any other options */
      }
    );

    qrScanner.start();
  }, []);

  return (
    <div>
      <p>QR-SCANNER</p>
      <p>RESULT: {JSON.stringify(result)}</p>
      <video width={500} height={500} ref={videoRef}></video>
    </div>
  );
}
