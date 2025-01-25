
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/globals.css";
import "./styles/profilepage.css"
import { SessionProvider } from "next-auth/react"
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from 'react-toastify'
import Header from "@/components/header/header";
import SubHeader from "@/components/SubHeader/SubHeader";
import { EdgeStoreProvider } from "@/lib/edgestore";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Being_Resonated",
  description: "Social Media Platform for IIEST Shibpur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SessionProvider>
            <ToastContainer />
            <EdgeStoreProvider>
              {children}
            </EdgeStoreProvider>
            <ToastContainer />
          </SessionProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}
