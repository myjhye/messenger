// 회원가입 - 비밀번호 해싱, 사용자 데이터베이스 추가

import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const body = await request.json();
        // 1. 요청에서 email, name, password 추출
        // 사용자로부터 이메일, 이름, 비밀번호 입력 받기
        const { email, name, password } = body;

        // 하나라도 입력 없으면 에러
        if (!email || !name || !password) {
            return new NextResponse('Missing info', { status: 400 });
        }

        // 2. 비밀번호 해싱 (해싱강도: 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. 데이터베이스에 새 사용자 추가
        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            }
        });

        // 4. 생성된 새 사용자를 json으로 반환
        return NextResponse.json(user);
    
    } catch (error: any) {
        console.log(error, 'REGISTRATION_ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }
    
}