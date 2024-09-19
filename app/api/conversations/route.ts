// 개인 대화 생성
// 그룹 대화 생성

import getCurrentUser from "@/app/actions/getCurrentUser"
import { NextResponse } from "next/server"
import prisma from "@/app/libs/prismadb"
import { pusherServer } from "@/app/libs/pusher";

interface Member {
    value: string;
};

export async function POST(request: Request) {
    try {
        // 현재 사용자 정보
        const currentUser = await getCurrentUser();

        const body = await request.json();
        const { userId, isGroup, members, name } = body;
        /*
            userId: 상대방 userid (개인 대화)
            isGroup: 그룹 대화 여부 (true/false)
            members: 사용자들 userid (그룹 대화, isGroup이 true일 때만 유효)
            name: 그룹 대화 이름 (isGroup이 true일 때만 유효)
        */

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 그룹 대화 생성 시 필수 데이터 유효성 검사
        // 그룹 대화(isGroup)일 경우 -> 멤버 데이터 미제공, 멤버 수가 2명 미만, 그룹 이름 미제공 시 에러
        if (isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse('Invalid data', { status: 400 });
        }

        //* 1. 그룹 대화 생성
        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    // 그룹 이름
                    name: name,
                    // 그룹 대화
                    isGroup: true,
                    users: {
                        connect: [
                            // 그룹 대화 참여자들(members) 연결
                            ...members.map((member: Member) => ({
                                id: member.value
                            })),
                            // 현재 사용자도 연결
                            {
                                id: currentUser.id
                            }
                        ]
                    }
                },
                include: {
                    // 모든 대화 참여자들 정보 포함 (알림 전송, 정보 표시 용도)
                    users: true
                }
            });

            // 모든 대화 참여자들(newConversation.users)에게 대화 생성 알림 전송 (pusher 사용)
            newConversation.users.forEach((user) => {
                if (user.email) {
                    pusherServer.trigger(user.email, 'conversation:new', newConversation);
                }
            })
            // 생성된 대화 정보를 json 형식으로 클라이언트에 전달
            return NextResponse.json(newConversation);
        }


        //* 2. 기존 개인 대화 조회 (기존 대화 찾기 -> 없으면 새로 생성)
        // 결과 값: 해당 사용자와의 대화 객체 (기존 대화 존재 시), [] (기존 대화 미존재 시) 
        const exisitingConversation = await prisma.conversation.findMany({
            where: {
                OR: [
                    // 현재 사용자와 상대방 사용자 일치 여부
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
        
        const singleConversation = exisitingConversation[0];

        // 기존 대화 존재 시 해당 대화 객체 반환
        if (singleConversation) {
            return NextResponse.json(singleConversation);
        }

        //* 3. 새 개인 대화 생성
        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        // 현재 사용자 연결
                        { 
                            id: currentUser.id 
                        },
                        // 대화 상대방 연결
                        { 
                            id: userId 
                        }
                    ]
                }
            },
            include: {
                // 모든 대화 참여자들(상대 사용자들, 현재 사용자) 정보 포함 (알림 전송, 정보 표시 용도)
                users: true
            }
        });

        // 모든 대화 참여자들(newConversation.users)에게 대화 생성 알림 전송 (pusher 사용)
        newConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(user.email, 'conversation:new', newConversation);
            }
        })

        // 생성된 대화 정보를 json 형식으로 클라이언트에 전달
        return NextResponse.json(newConversation);

    } catch (error: any) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}