// 현재 사용자가 참여한 모든 대화 목록
// 각 대화에 속한 사용자들과, 메세지들

import prisma from "@/app/libs/prismadb"
import getCurrentUser from "./getCurrentUser"

export default async function getConversations() {
    // 현재 로그인한 사용자
    const currentUser = await getCurrentUser();

    // 사용자가 로그인 되어 있지 않으면 빈 배열 반환
    if (!currentUser?.id) {
        return [];
    }

    try {
        // 대화 목록 조회
        const conversations = await prisma.conversation.findMany({
            // 최신순 정렬
            orderBy: {
                lastMessageAt: "desc"
            },
            // 현재 사용자가 포함된 대화만 조회
            where: {
                userIds: {
                    has: currentUser.id
                }
            },
            // 관련 데이터 포함 - 사용자 정보(대화에 포함된 사용자 정보), 메세지 정보(메세지를 보낸 사용자 정보, 메세지를 본 사용자 정보)
            include: {
                users: true,
                messages: {
                    include: {
                        sender: true,
                        seen: true,
                    }
                }
            }
        });

        return conversations;

    } catch (error: any) {
        return [];
    }
};