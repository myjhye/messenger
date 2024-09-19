// 로그인 수단(인증 제공자) 정의 (깃허브, 구글, 일반 로그인)
// 클라이언트에서 signIn 함수(로그인), useSession 함수(인증 정보 조회)로 사용
// [...nextauth].ts : 인증(로그인, 로그아웃, 세션 관리)과 관련된 모든 요청 처리

import { authOptions } from "@/app/libs/authOptions";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);

export { 
    handler as GET,
    handler as POST, 
};

/*
    GET: 로그인한 사용자 정보 조회 (useSession 함수)
    POST: 로그인 처리 (signIn 함수)
    --> handler로 외부 파일(클라이언트)에서 로그인한 사용자의 세션 정보 조회, 로그인 처리
*/
