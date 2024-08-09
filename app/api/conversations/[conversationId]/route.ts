// 대화 삭제

import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
    conversationId?: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    try {

        const { conversationId } = params;

        const currentUser = await getCurrentUser();

        // 현재 사용자가 로그인 되어 있는지 확인
        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. 대화 조회: 삭제하려는 대화가 존재하는지
        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                // 대화에 포함된 사용자들 조회 (현재 사용자가 대화에 참여 중인지)
                users: true,
            },
        });

        // 찾는 대화가 없으면 에러
        if (!existingConversation) {
            return new NextResponse('Invalid ID', { status: 400 });
        }

        // 2. 대화 삭제
        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    // userIds 배열에 현재 사용자가 포함되어 있는지 (현재 사용자가 포함된 대화만 삭제)
                    hasSome: [currentUser.id]
                }
            }
        });

        // 3. 실시간 알림 전송 (대화가 삭제되었음을 대화에 참여 중인 모든 사용자들에게 알림)
        existingConversation.users.forEach((user) => {
            if (user.email) {
                // existingConversation을 삭제했다고 알림
                pusherServer.trigger(user.email, 'conversation:remove', existingConversation)
            }
        })

        // 삭제된 대화 반환
        return NextResponse.json(deletedConversation);

    } catch (error: any) {
        console.log(error, 'ERROR_CONVERSATION_DELETE');
        return new NextResponse('Internal Error', { status: 500 });
    }
}