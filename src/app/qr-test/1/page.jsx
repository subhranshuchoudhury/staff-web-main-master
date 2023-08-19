"use client";

import React from "react";
import Scanner from "../../../../components/Scanner";
import { useState } from "react";

const Page = () => {
  const [result, setResult] = useState("No data found");

  return (
    <div>
      <Scanner onDetected={(e) => setResult(e?.codeResult?.code)} />
      <p className="text-center">{result}</p>
    </div>
  );
};

export default Page;
