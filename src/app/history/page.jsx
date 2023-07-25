"use client";

import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => router.push("/history/purchase")}
        className="btn btn-accent w-44 h-28 m-5"
      >
        Purchase History
      </button>
      <button
        onClick={() => alert("❌ Module not found!")}
        className="btn btn-accent w-44 h-28 m-5"
      >
        Sale History
      </button>
      <button
        onClick={() => alert("❌ Module not found!")}
        className="btn btn-accent w-44 h-28 m-5"
      >
        Stock History
      </button>
    </div>
  );
};

export default Page;
