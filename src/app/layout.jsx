// app/layout.jsx
import "./globals.css";
import { Suspense } from "react";
import Navbar from "./navbar";

export const metadata = {
  title: {
    default: "Jyeshtha Motors",
    template: "%s | Jyeshtha Motors"
  },
  description: "Dedicated web app for Jyeshtha Motors.",
  keywords: "Jyeshtha Motors, Motors, Jyeshtha",
  authors: [{ name: "Jyeshtha Motors" }],
  creator: "Jyeshtha Motors",
};

export default function RootLayout({ children }) {
  return (
    <html data-theme="synthwave" lang="en">
      <head>
        <meta name="description" content="Web App for managing Jyeshtha Motors shop." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-base-100">
        <Navbar />
        <main className="flex-1 pt-16">
          <Suspense fallback={
            <div className="flex justify-center items-center min-h-[200px]">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }>
            {children}
          </Suspense>
        </main>
        <footer className="footer footer-center p-4 bg-base-200 text-base-content">
          <p>© {new Date().getFullYear()} Jyeshtha Motors</p>
        </footer>
      </body>
    </html>
  );
}
