// 대화하는 상대방 정보 (단일 사용자)

import { FullConversationType } from "../types";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export default function useOtherUser (conversation: FullConversationType) {

    const session = useSession();

    const otherUser = useMemo(() => {
        const currentUserEmail = session?.data?.user?.email;
        const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail);

        // 첫 번째 사용자만 반환
        return otherUser[0];


    // session?.data?.user?.email: 현재 로그인한 사용자 변경되면 재계산
    // conversation.users: 대화 상대방이 추가되거나 대화에서 나갈 때 재계산
    }, [session?.data?.user?.email, conversation.users]);

    return otherUser;
};