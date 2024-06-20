// 대화 내에서 현재 로그인한 사용자 제외한 사용자 목록 조회
// 좌측 사이드바 대화 항목의 상대방 정보 표시

import { User } from "@prisma/client";
import { FullConversationType } from "../types";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

const useOtherUser = (conversation: FullConversationType | { users: User[] }) => {

    const session = useSession();

    const otherUser = useMemo(() => {
        const currentUserEmail = session?.data?.user?.email;
        const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail);

        return otherUser[0];

    }, [session?.data?.user?.email, conversation.users]);

    return otherUser;
};

export default useOtherUser;