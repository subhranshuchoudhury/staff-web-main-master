"use client";
import React, { useEffect, useState } from "react";

export default function () {
  const [LoadedWeb, setLoadedWeb] = useState(false);
  useEffect(() => {
    setLoadedWeb(true);
  }, []);

  return (
    <div>
      {LoadedWeb && (
        <div>
          <p>{localStorage.key(0)}</p>
          <p>{localStorage.key(1)}</p>
          <p>{localStorage.key(2)}</p>
          <p>{localStorage.key(3)}</p>
          <p>{localStorage.key(4)}</p>
          <p>{localStorage.key(5)}</p>
          <p>{localStorage.key(6)}</p>
          <p>{localStorage.key(7)}</p>
          <p>{localStorage.key(8)}</p>
          <p>{localStorage.key(9)}</p>
          <p>{localStorage.key(10)}</p>
          <p>{localStorage.key(11)}</p>
          <p>{localStorage.key(12)}</p>
        </div>
      )}
    </div>
  );
}
