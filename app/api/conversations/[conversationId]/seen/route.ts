// 특정 대화의 대화의 마지막 메시지를 현재 사용자가 읽었음을 표시

import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

interface IParams {
    conversationId?: string;
}

export async function POST(
    request: Request,
    { params }: { params: IParams }
) {
    try {
        const currentUser = await getCurrentUser();
        const { conversationId } = params;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // 특정 대화 조회
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                messages: {
                    include: {
                        // 메시지를 본 사용자 정보 포함
                        seen: true
                    }
                },
                users: true,
            }
        });

        if (!conversation) {
            return new NextResponse('Invalid ID', { status: 400 });
        }

        // 마지막 메세지 가져오기
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if (!lastMessage) {
            return NextResponse.json(conversation);
        }

        // 마지막 메세지를 업데이트해 현재 사용자가 읽었음을 표시
        const updatedMessage = await prisma.message.update({
            where: {
                id: lastMessage.id
            },
            include: {
                // 메세지를 보낸 사용자 정보 포함
                sender: true,
                // 메세지를 본 사용자 정보 포함
                seen: true
            },
            data: {
                seen: {
                    connect: {
                        // 현재 사용자 ID 연결
                        id: currentUser.id
                    }
                }
            }
        });

        return NextResponse.json(updatedMessage);

    } catch (error: any) {
        console.log(error, 'ERROR_MESSAGES_SEEN');
        return new NextResponse("Internal Error", { status: 500 });
    }
}