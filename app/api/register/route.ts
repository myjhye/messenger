// 회원가입

import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const body = await request.json();
        // 1. 클라이언트에서 '이메일, 이름, 비밀번호' 입력 받기
        const { email, name, password } = body;

        // 하나라도 입력 없으면 에러
        if (!email || !name || !password) {
            return new NextResponse('Missing info', { status: 400 });
        }

        // 2. 비밀번호 해싱 (해싱강도: 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. 데이터베이스에 새 사용자 추가
        const user = await prisma.user.create({
            // data 객체에 담아서 저장 (prisma 특징)
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