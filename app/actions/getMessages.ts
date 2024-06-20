// conversationId로 특정 대화에 속한 메세지 목록 조회

import prisma from "@/app/libs/prismadb"

const getMessages = async (conversationId: string) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            include: {
                sender: true,
                seen: true,
            },
            orderBy: {
                createdAt: 'asc'
            },
        });

        return messages;
    } catch (error: any) {
        return [];
    }
}

export default getMessages;