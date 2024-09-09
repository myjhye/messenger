// 로그인 수단(인증 제공자) 정의 (깃허브, 구글, 일반 로그인)

import { authOptions } from "@/app/libs/authOptions";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);

export { 
    handler as GET,
    handler as POST, 
};

/*
    GET: 로그인한 사용자 정보 조회
    POST: 로그인 처리
    --> handler로 외부 파일에서 로그인한 사용자의 세션 정보 조회, 로그인 처리
*/
