// 로그인 세션 전역 유지

"use client"

import { SessionProvider } from "next-auth/react";
import React from "react";

interface AuthContextProps {
    children: React.ReactNode
}

export default function AuthContext({ children }: AuthContextProps) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}