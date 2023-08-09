import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Jyestha Motors",
  description: "Dedicated web app for Jyestha Motors.",
};

export default function RootLayout({ children }) {
  return (
    <html data-theme="synthwave" lang="en">
      <head>
        <title>Jyestha Motors PWA</title>
        <meta
          name="description"
          content="Web App for managing Jyestha Motors shop."
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
                  <Link href={"/purchase/party"}>Add New Party</Link>
                </li>
                <li>
                  <Link href={"/purchase/item"}>Add New Item</Link>
                </li>
                <li>
                  <Link href={"/purchase/history"}>History</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="navbar-center">
            <Link
              href="/"
              className="btn btn-ghost normal-case text-2xl font-bold"
            >
              Jyestha Motors
            </Link>
          </div>
          <div className="navbar-end"></div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="/assets/images/jyesthalogo.jpg" />
              </div>
            </label>
          </div>
        </div>
        <div className="my-16"></div>
        {children}
      </body>
    </html>
  );
}
