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
            userId: 상대방 사용자 ID
            isGroup: 그룹 대화 여부 (true/false)
            members: 그룹 대화 참여 사용자들의 ID 목록
            name: 그룹 대화 이름
        */

        // 사용자 로그인 유무 확인
        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 그룹 대화 생성 시 필수 데이터 유효성 검사
        // 그룹 대화가 true가 아니고, 멤버 정보가 없거나, 멤버 수가 2명 미만이거나, 그룹 이름 미제공 시
        if (isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse('Invalid data', { status: 400 });
        }

        //** 1. 그룹 대화 생성
        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    // 그룹 이름
                    name: name,
                    // 그룹 대화 여부
                    isGroup: true,
                    users: {
                        connect: [
                            // 그룹 멤버들(나 제외) 연결
                            ...members.map((member: Member) => ({
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
                    // 대화에 참여하는 모든 사용자들 정보(프로필, 이름, 이메일 등) 포함
                    // 대화 화면에 대화 참여자들 정보(프로필, 이름) 표시 용도 
                    users: true
                }
            });

            // pusher로 모든 대화 참여자들(newConversation.users)에게 대화 생성 알림 전송
            newConversation.users.forEach((user) => {
                if (user.email) {
                    // user.email: 모든 대화 참여자들
                    // conversation:new 이벤트 이름
                    // newConversation: 생성된 대화 정보
                    pusherServer.trigger(user.email, 'conversation:new', newConversation);
                }
            })

            // 생성된 대화 정보를 json 형식으로 클라이언트에 전달
            return NextResponse.json(newConversation);
        }


        //** 2. 기존 개인 대화 조회 (기존 대화 찾기 -> 없으면 새로 생성)
        // 현재 사용자와 상대방 사용자 간의 기존 대화 존재 여부 확인
        // 결과 값: 해당 사용자와의 대화 객체 (기존 대화 존재 시), [] (기존 대화 미존재 시) 
        const exisitingConversation = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        userIds: {
                            equals: [
                                // 현재 사용자와 상대방 사용자 일치 여부
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

        //** 3. 새 개인 대화 생성
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
                // 모든 대화 참여자들 정보 포함 (프로필, 이름 등)
                // 대화 화면에 표시 용도 (프로필, 이름)
                users: true
            }
        });

        // pusher로 모든 대화 참여자들(newConversation.users)에게 대화 생성 알림 전송
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