
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/globals.css";
import "./styles/profilepage.css"
import { SessionProvider } from "next-auth/react"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from "@/components/header/header";

import { EdgeStoreProvider } from "@/lib/edgeStoreRouter";
import { AuthProvider } from "@/lib/hooks/useAuth";
import Providers from "./providers";


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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased inset-0 bg-gradient-to-br from-black via-gray-900 to-black`}
      >
        <AuthProvider>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
         
          <Providers>
            <EdgeStoreProvider>
              <Header/>
              {children}
            </EdgeStoreProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
