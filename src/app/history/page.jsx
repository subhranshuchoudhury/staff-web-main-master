"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();

  const [Navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, []);

  const routePath = (path) => {
    router.push(path);
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="mb-9">Your History</div>
      {Navigating ? (
        <div>
          <span className="loading loading-bars loading-lg"></span>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-center">
        <div
          onClick={() => routePath("/history/purchase")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/purchase.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>PURCHASE</p>
        </div>
        <div className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent grayscale hover:cursor-not-allowed">
          <Image
            src="/assets/images/sale.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>SALE</p>
        </div>
        <div className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent grayscale hover:cursor-not-allowed">
          <Image
            src="/assets/images/store.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>STOCK</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
