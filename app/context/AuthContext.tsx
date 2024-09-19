// 로그인 세션 전역 유지
// 브라우저 새로고침이나 다른 페이지로 이동 시에도 로그인 상태 유지 용도

// 이게 있어야 useSession을 통해 클라이언트 세션 정보를 조회할 수 있음
// 세션 유무에 따른 화면 변경 용도

"use client"

import { SessionProvider } from "next-auth/react";
import React from "react";

interface AuthContextProps {
    children: React.ReactNode
}

export default function AuthContext({ children }: AuthContextProps) {
    return (
        // SessionProvider: 로그인 후 생성된 세션(JWT)을 전역 유지
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}