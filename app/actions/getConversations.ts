// 현재 사용자가 참여한 모든 대화 목록 조회 (현재 사용자가 속한 대화방 목록 표시 용도)

import prisma from "@/app/libs/prismadb"
import getCurrentUser from "./getCurrentUser"

export default async function getConversations() {
    // 현재 사용자
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
        return [];
    }

    try {
        // 대화 목록 조회 (현재 사용자가 포함된, 최신순)
        const conversations = await prisma.conversation.findMany({
            // 최신순
            orderBy: {
                lastMessageAt: "desc"
            },
            // 현재 사용자가 포함된 대화만 조회
            where: {
                userIds: {
                    has: currentUser.id
                }
            },
            // 추가로 조회하는 데이터
            // 대화에 포함된 모든 사용자들 정보 (프로필, 이름 등)
            // 메세지 발신자 정보, 메세지 본 사용자들 정보 ()
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