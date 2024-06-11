import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterContext from "./context/ToasterContext";
import AuthContext from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Messenger",
  description: "Messenger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 세션 전역 유지 */}
        <AuthContext>
          {/* toaster 전역 사용 */}
          <ToasterContext />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
