// 특정 대화(conversationId) 정보 조회

import getCurrentUser from "./getCurrentUser";
import prisma from "@/app/libs/prismadb";

export default async function getConversationById (conversationId: string) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.email) {
            return null;
        }

        // 특정 대화 조회
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                users: true,
            },
        });

        // 조회된 대화 정보 반환
        return conversation;

    } catch (error: any) {
        return null;
    }
};