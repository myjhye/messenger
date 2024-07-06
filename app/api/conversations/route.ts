// 개인 대화 생성, 조회
// 그룹 대화 생성

import getCurrentUser from "@/app/actions/getCurrentUser"
import { NextResponse } from "next/server"
import prisma from "@/app/libs/prismadb"
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
    try {
        // 현재 로그인한 사용자 정보 가져오기
        const currentUser = await getCurrentUser();

        // 요청 본문을 json으로 파싱
        const body = await request.json();
        const { userId, isGroup, members, name } = body;

        // 사용자가 로그인 되어 있는지 확인
        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 그룹 대화 생성 시 필수 데이터의 유효성 검사
        if (isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse('Invalid data', { status: 400 });
        }

        //** 1. 그룹 대화 생성
        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    // 그룹 이름
                    name,
                    // 그룹 대화 여부
                    isGroup,
                    users: {
                        connect: [
                            // 그룹 멤버 연결
                            ...members.map((member: { value: string }) => ({
                                id: member.value
                            })),
                            {
                                // 현재 사용자도 그룹 멤버로 연결
                                id: currentUser.id
                            }
                        ]
                    }
                },
                include: {
                    // 포함된 사용자 정보
                    users: true
                }
            });

            // pusher로 새로운 대화 알림 전송
            newConversation.users.forEach((user) => {
                if (user.email) {
                    pusherServer.trigger(user.email, 'conversation:new', newConversation);
                }
            })

            // 생성된 대화를 json으로 반환
            return NextResponse.json(newConversation);
        }


        //** 2. 기존 개인 대화 조회
        const exisitingConversation = await prisma.conversation.findMany({
            where: {
                OR: [
                    // 대화에 포함된 사용자 ID 배열이 현재 사용자와 다른 사용자의 ID 배열과 같아야 함
                    {
                        userIds: {
                            equals: [
                                currentUser.id, 
                                userId,
                            ]
                        }
                    },
                    {
                        userIds: {
                            equals: [
                                userId,
                                currentUser.id,
                            ]
                        }
                    }
                ]
            }
        });

        // 기존 대화가 있으면 반환
        const singleConversation = exisitingConversation[0];

        if (singleConversation) {
            return NextResponse.json(singleConversation);
        }

        //** 3. 새 개인 대화 생성
        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        // 현재 사용자 연결
                        { id: currentUser.id },
                        // 대화 상대방 연결
                        { id: userId }
                    ]
                }
            },
            include: {
                // 포함된 사용자 정보
                users: true
            }
        });

        // pusher로 새로운 대화 알림 전송
        newConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(user.email, 'conversation:new', newConversation);
            }
        })

        // 생성된 개인 대화를 json 응답으로 반환
        return NextResponse.json(newConversation);

    } catch (error: any) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}