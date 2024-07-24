import Link from "next/link";
import "./globals.css";
import { Suspense } from "react";

export const metadata = {
  title: "Jyeshtha Motors",
  description: "Dedicated web app for Jyeshtha Motors.",
  keywords: "Jyeshtha Motors, Motors, Jyeshtha",
};

export default function RootLayout({ children }) {
  return (
    <html data-theme="synthwave" lang="en">
      <head>
        <title>Jyeshtha Motors</title>
        <meta
          name="description"
          content="Web App for managing Jyeshtha Motors shop."
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="h-screen">
        <div className="navbar bg-base-100">
          <div className="navbar-start">
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 p-2 bg-blue-950  rounded-box w-52 z-20"
              >
                
                <li>
                  <Link href={"/"}>Home</Link>
                </li>
                <li>
                  <Link href={"/purchase"}>Purchase</Link>
                </li>
                <li>
                  <Link href={"/purchase/dynamic"}>Excel Purchase</Link>
                </li>
                <li>
                  <Link href={"/add-item-group"}>Add Group</Link>
                </li>
                <li>
                  <Link href={"/purchase/party"}>Add Party</Link>
                </li>
                <li>
                  <Link href={"/history"}>History</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="navbar-center mt-6">
            <Link
              href="/"
              className="btn btn-ghost uppercase font-mono glass text-xl"
            >
              Jyeshtha Motors
            </Link>
          </div>
          <div className="navbar-end"></div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="/assets/images/jmlogo.jpg" />
              </div>
            </label>
          </div>
        </div>
        <div className="my-16"></div>
        <Suspense fallback={null}>
        {children}
        </Suspense>
      </body>
    </html>
  );
}
