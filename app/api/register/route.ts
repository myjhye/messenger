// 회원가입 - 비밀번호 해싱, 사용자 데이터베이스 추가

import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST( 
    request: Request
) {

    try {
        // 요청에서 email, name, password 추출
        const body = await request.json();
        const { email, name, password } = body;

        // 하나라도 입력 없으면 에러
        if (!email || !name || !password) {
            return new NextResponse('Missing info', { status: 400 });
        }

        // 비밀번호 해싱 (해싱강도: 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // 데이터베이스에 새 사용자 추가
        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            }
        });

        // 생성된 새 사용자를 json으로 반환
        return NextResponse.json(user);
    
    } catch (error: any) {
        console.log(error, 'REGISTRATION_ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }
    
}