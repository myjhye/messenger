// 전체 레이아웃

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
          {/* 토스터 알림 전역 사용 */}
          {/* children을 받지 않기 때문에 children을 감싸지 않음 */}
          {/* 알림과 함께 다른 컴포넌트를 표시해야하면 감싸야 하지만 현재로서는 알림 기능만 하기 때문 */}
          <ToasterContext />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
