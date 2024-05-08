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
      <p className="glass text-center text-[40px] font-mono mb-9 rounded-xl w-full">
        Welcome
      </p>
      {Navigating ? (
        <div>
          <span className="loading loading-bars loading-lg"></span>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-center">
        <div
          onClick={() => routePath("/purchase")}
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
        <div
          onClick={() => routePath("/purchase/dynamic")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/excel.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>EXCEL PURCHASE</p>
        </div>
        <div
          onClick={() => routePath("/purchase/item")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/receipt-item.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>ADD ITEM</p>
        </div>
        <div
          onClick={() => routePath("/add-item-group")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/group.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>ADD GROUP</p>
        </div>
        <div
          onClick={() => routePath("/purchase/party")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/group (1).png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>ADD PARTY</p>
        </div>
        <div
          onClick={() => {
            routePath("/sale");
          }}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/sale.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>SALE</p>
        </div>

        <div
          onClick={() => routePath("/stock")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/store.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>STOCK</p>
        </div>
        <div
          onClick={() => routePath("/history")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/folder-history.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>HISTORY</p>
        </div>
        <div
          onClick={() => routePath("/settings")}
          className="btn btn-info text-white w-44 h-28 m-5 shadow-2xl hover:shadow-white flex-col bg-transparent"
        >
          <Image
            src="/assets/images/settings.png"
            alt="purchase"
            width={50}
            height={50}
          />
          <p>SETTINGS</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
