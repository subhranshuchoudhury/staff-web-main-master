"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [Navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, []);

  const router = useRouter();
  const routePath = (path) => {
    setNavigating(true);
    router.push(path);
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <p className="glass text-center h-2 mb-9 rounded-xl w-1/2"></p>
      {Navigating ? (
        <div>
          <span className="loading loading-bars loading-lg"></span>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-center">
        <div
          onClick={() => routePath("utility/pdf-barcode-generate")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/printer.png"
            alt="settings"
            width={50}
            height={50}
          />
          <p>PDF Barcode Generate</p>
        </div>
        <div
          onClick={() => routePath("utility/discount-matrix")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/settings.png"
            alt="settings"
            width={50}
            height={50}
          />
          <p>Discount Matrix</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
