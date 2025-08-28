// app/navbar.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isRootPage = pathname === "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Refs for dropdowns to handle outside clicks
  const mobileMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsLoggedIn(authStatus === "true");
    
    // Close all menus when route changes
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setProfileMenuOpen(false);
    router.push("/");
  };

  // Don't render navbar on root page
  if (isRootPage) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/purchase", label: "Purchase" },
    { href: "/purchase/dynamic", label: "Excel Purchase" },
    { href: "/add-item-group", label: "Add Group" },
    { href: "/purchase/party", label: "Add Party" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="navbar bg-base-100 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="navbar-start">
        <div className="dropdown" ref={mobileMenuRef}>
          <div 
            tabIndex={0} 
            role="button"
            className="btn btn-ghost btn-circle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          </div>
          {mobileMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-2 bg-blue-950 rounded-box w-52 z-20 shadow-xl"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:bg-blue-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="navbar-center">
        <Link
          href="/dashboard"
          className="btn btn-ghost uppercase font-mono text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          Jyeshtha Motors
        </Link>
      </div>
      
      <div className="navbar-end">
        <div className="dropdown dropdown-end" ref={profileMenuRef}>
          <div 
            tabIndex={1} 
            role="button"
            className="btn btn-ghost btn-circle avatar"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <div className="w-10 rounded-full ring-2 ring-blue-500">
              <img 
                src="/assets/images/jmlogo.jpg" 
                alt="Profile" 
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
          
          {profileMenuOpen && (
            <ul
              tabIndex={1}
              className="menu menu-sm dropdown-content mt-3 p-2 bg-blue-950 rounded-box w-52 z-20 shadow-xl"
            >
              <li className="px-4 py-2 text-white border-b border-blue-800">
                <span className="text-sm font-medium">
                  {localStorage.getItem("email") || "User"}
                </span>
              </li>
              <li>
                <button 
                  className="hover:bg-blue-700 w-full text-left"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Profile Settings
                </button>
              </li>
              <li>
                {isLoggedIn ? (
                  <button 
                    className="hover:bg-red-700 text-red-200 w-full text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    href="/" 
                    className="hover:bg-blue-700 w-full"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
