// 대화 중인 상대방 정보
// 대화 방에서 상대방 프로필 표시 용도 (헤더 등)

import { FullConversationType } from "../types";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export default function useOtherUser (conversation: FullConversationType) {

    const session = useSession();

    const otherUser = useMemo(() => {
        const currentUserEmail = session?.data?.user?.email;
        // 대화 참여자들 중 '현재 사용자 제외한 사용자들' 조회
        const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail);

        // 첫 번째 사용자만 반환
        return otherUser[0];

    // session?.data?.user?.email: 현재 사용자 변경 시(로그아웃) 재계산
    // conversation.users: 대화 상대방이 추가되거나 대화에서 나갈 시 재계산
    }, [session?.data?.user?.email, conversation.users]);

    return otherUser;
};