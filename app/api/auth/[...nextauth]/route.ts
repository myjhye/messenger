// 로그인 (인증 요청)
// 인증 제공자 설정(깃허브, 구글, 일반 로그인)

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from "@/app/libs/prismadb";
import NextAuth from "next-auth/next";

export const authOptions: AuthOptions = {

    // PrismaAdapter에 prisma 인스턴스 전달(auth, prisma 통합 목적)
    adapter: PrismaAdapter(prisma),

    // 인증 제공자 설정
    providers: [
        // 1.
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        // 2.
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        // 3. 이메일, 비밀번호 기반의 인증 제공자 설정
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {
                    label: 'email',
                    type: 'text',
                },
                password: {
                    label: 'password',
                    type: 'password',
                },
            },

            // auth
            async authorize(credentials) {
                // 이메일과 비밀번호가 제공되지 않은 경우 오류 발생
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                // prisma의 user 스키마에서 사용자 찾기
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                // 사용자가 없거나 비밀번호가 없으면 오류 발생
                if (!user || !user?.hashedPassword) {
                    throw new Error('Invalid credentials');
                }

                // 입력된 비밀번호와 해시된 비밀번호 비교
                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword,
                );

                // 비밀번호가 일치하지 않으면 오류 발생
                if (!isCorrectPassword) {
                    throw new Error('Invalid credentials');
                }

                // 인증 성공 시 사용자를 반환
                return user;
            }
        })
    ],


    // 개발 환경에서는 디버그 모드 활성화
    debug: process.env.NODE_ENV === 'development',
    // 인증 수단 : jwt
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { 
    handler as GET,
    handler as POST, 
};

/*
    GET: 로그인한 사용자 정보 조회
    POST: 로그인, 로그아웃 처리
*/