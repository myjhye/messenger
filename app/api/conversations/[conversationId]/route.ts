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
    // 경로 파라미터에서 conversationId를 추출
    { params }: { params: IParams }
) {
    try {

        // 요청에서 conversationId 추출
        const { conversationId } = params;

        // 현재 로그인한 사용자 정보 가져오기
        const currentUser = await getCurrentUser();

        // 사용자가 로그인 되어 있는지 확인
        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 주어진 conversationId로 대화 찾기 (삭제하려는 대화가 사용자가 참여 중인지 확인)
        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                // 대화에 포함된 사용자 정보도 함께 가져오기
                users: true,
            },
        });

        // 찾는 대화가 없으면 에러
        if (!existingConversation) {
            return new NextResponse('Invalid ID', { status: 400 });
        }

        // 대화 삭제
        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                // 주어진 conversationId와 일치하는 대화
                id: conversationId,
                userIds: {
                    // 현재 사용자가 포함된 대화만 삭제
                    hasSome: [currentUser.id]
                }
            }
        });

        existingConversation.users.forEach((user) => {
            if (user.email) {
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