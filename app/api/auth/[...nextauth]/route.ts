// 로그인 수단(인증 제공자) 정의 (깃허브, 구글, 일반 로그인)

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from "@/app/libs/prismadb";
import NextAuth from "next-auth/next";

export const authOptions: AuthOptions = {

    // PrismaAdapter: next-auth 인증 정보(회원가입한 사용자 정보)를 prisma 데이터베이스에 저장
    // 이 경우에는 OAuth(github, google)으로 로그인한 사용자 정보 저장
    adapter: PrismaAdapter(prisma),

    // 로그인 수단(인증 제공자) 설정
    providers: [
        // 1. 깃허브
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        // 2. 구글
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        // 3. 이메일, 비밀번호
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

            // (3)단계에서 입력받은 이메일과 비밀번호로 로그인 처리
            async authorize(credentials) {
                // 이메일과 비밀번호 미입력 시 에러
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                // 입력된 이메일과 일치하는 사용자 조회
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                // 입력한 이메일이나 비밀번호 틀릴 시 에러
                if (!user || !user?.hashedPassword) {
                    throw new Error('Invalid credentials');
                }

                // 입력된 비밀번호와 해시된 비밀번호 비교
                const isCorrectPassword = await bcrypt.compare(
                    // 입력한 비밀번호
                    credentials.password,
                    // 데이터베이스에 저장된 해시 비밀번호
                    user.hashedPassword,
                );

                // 비밀번호가 불일치 시 에러
                if (!isCorrectPassword) {
                    throw new Error('Invalid credentials');
                }

                // 입력한 이메일과 비밀번호가 일치하는 사용자 반환
                return user;
            }
        })
    ],

    // 개발 환경(앱이 개발 환경에서 실행)에서는 디버그 모드 활성화(콘솔에 더 많은 디버그 정보 출력 -> 개발자가 인증 관련 문제 쉽게 추적 용도)
    debug: process.env.NODE_ENV === 'development',
    // 화면(클라이언트) 세션 유지 수단: jwt (로그인 전, 후 다른 화면 조회)
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
    POST: 로그인 처리
    --> handler로 외부 파일에서 로그인한 사용자의 세션 정보 조회, 로그인 처리
*/
