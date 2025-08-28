// app/layout.jsx
import Link from "next/link";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "./navbar"; // Adjust the path as needed

export const metadata = {
  title: "Jyeshtha Motors",
  description: "Dedicated web app for Jyeshtha Motors.",
  keywords: "Jyeshtha Motors, Motors, Jyeshtha",
};

export default function RootLayout({ children }) {
  return (
    <html data-theme="synthwave" lang="en">
      <head>
        <meta
          name="description"
          content="Web App for managing Jyeshtha Motors shop."
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="h-screen">
        <Navbar />
        <div className="my-16"></div>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
