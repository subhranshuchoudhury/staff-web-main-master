// app/navbar.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isRootPage = pathname === "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsLoggedIn(authStatus === "true");
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push("/");
  };

  // Don't render navbar on root page
  if (isRootPage) {
    return null;
  }

  return (
    <div className="navbar bg-base-100 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <label 
            tabIndex={0} 
            className="btn btn-ghost btn-circle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
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
          {dropdownOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-2 bg-blue-950 rounded-box w-52 z-20 shadow-xl"
            >
              <li>
                <Link href={"/dashboard"} onClick={() => setDropdownOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={"/purchase"} onClick={() => setDropdownOpen(false)}>
                  Purchase
                </Link>
              </li>
              <li>
                <Link href={"/purchase/dynamic"} onClick={() => setDropdownOpen(false)}>
                  Excel Purchase
                </Link>
              </li>
              <li>
                <Link href={"/add-item-group"} onClick={() => setDropdownOpen(false)}>
                  Add Group
                </Link>
              </li>
              <li>
                <Link href={"/purchase/party"} onClick={() => setDropdownOpen(false)}>
                  Add Party
                </Link>
              </li>
              <li>
                <Link href={"/history"} onClick={() => setDropdownOpen(false)}>
                  History
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
      
      <div className="navbar-center">
        <Link
          href="/dashboard"
          className="btn btn-ghost uppercase font-mono text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Jyeshtha Motors
        </Link>
      </div>
      
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label 
            tabIndex={1} 
            className="btn btn-ghost btn-circle avatar"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="w-10 rounded-full ring-2 ring-blue-500">
              <img src="/assets/images/jmlogo.jpg" alt="Profile" />
            </div>
          </label>
          
          {profileDropdownOpen && (
            <ul
              tabIndex={1}
              className="menu menu-sm dropdown-content mt-3 p-2 bg-blue-950 rounded-box w-52 z-20 shadow-xl"
            >
              <li className="px-4 py-2 text-white border-b border-blue-800">
                <span className="text-sm">
                  {localStorage.getItem("email") || "User"}
                </span>
              </li>
              <li>
                <a className="hover:bg-blue-700" onClick={() => setProfileDropdownOpen(false)}>
                  Profile Settings
                </a>
              </li>
              <li>
                {isLoggedIn ? (
                  <a 
                    className="hover:bg-red-700 text-red-200"
                    onClick={handleLogout}
                  >
                    Logout
                  </a>
                ) : (
                  <Link 
                    href="/" 
                    className="hover:bg-blue-700"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
