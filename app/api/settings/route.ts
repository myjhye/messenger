// 프로필 업데이트

import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { name, image } = body;

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        //* 프로필 업데이트
        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                // 새 이미지 url
                image: image,
                // 새 사용자 이름
                name: name,
            },
        });

        // 업데이트된 프로필 정보 JSON으로 반환
        return NextResponse.json(updatedUser);

    } catch (error: any) {
        console.log(error, 'ERROR_SETTINGS');
        return new NextResponse('Internal Error', { status: 500 });
    }
}