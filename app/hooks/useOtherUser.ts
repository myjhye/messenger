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

    }, [session?.data?.user?.email, 
        conversation.users
    ]);

    return otherUser;
};