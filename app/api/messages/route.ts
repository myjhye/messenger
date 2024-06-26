// 새로운 메세지를 데이터베이스에 저장
// 대화의 상태 업데이트

import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherClient, pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { message, image, conversationId } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        //** 새로운 메세지 데이터베이스에 저장
        const newMessage = await prisma.message.create({
            data: {
                // 메세지 본문
                body: message,
                // 첨부 이미지 (있으면)
                image: image,
                conversation: {
                    connect: {
                        id: conversationId,
                    },
                },
                sender: {
                    connect: {
                        // 메세지 보낸 사용자 ID
                        id: currentUser.id,
                    },
                },
                seen: {
                    connect: {
                        // 메세지를 본 사용자 목록에 현재 사용자 추가
                        id: currentUser.id,
                    },
                }
            },
            include: {
                // 메세지를 본 사용자 정보 포함
                seen: true,
                // 메세지를 보낸 사용자 정보 포함
                sender: true,
            },
        });


        //** 대화 상태 업데이트
        const updatedConversation = await prisma.conversation.update({
            where: {
                // 업데이트할 대화 ID
                id: conversationId
            },
            data: {
                // 마지막 메세지 시간 갱신
                lastMessageAt: new Date(),
                messages: {
                    connect: {
                        id: newMessage.id,
                    },
                },
            },
            include: {
                users: true,
                messages: {
                    include: {
                        seen: true,
                    },
                },
            },
        });

        await pusherServer.trigger(conversationId, 'message:new', newMessage);

        const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

        updatedConversation.users.map((user) => {
            pusherServer.trigger(user.email!, 'conversation:update', {
                id: conversationId,
                messages: [lastMessage],
            })
        });

        // 생성된 메세지를 JSON 응답으로 변환
        return NextResponse.json(newMessage);

    } catch (error: any) {
        console.log(error, "ERROR_MESSAGE");
        return new NextResponse('Internal Error', { status: 500 });
    }
}