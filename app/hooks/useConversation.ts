// 현재 url의 파라미터의 conversationId를 추출해 전역 사용
// consersationId 유무에 따른 isOpen 상태 (true/false) 전역 사용

import { useParams } from "next/navigation"
import { useMemo } from "react";

export default function useConversation() {
    const params = useParams();

    // 1. url 파라미터의 conversationId
    // useMemo: params.conversationId 값이 변경될 때만 재계산
    const conversationId = useMemo(() => {
        // params?.conversationId: 파일 이름이 [conversationId].tsx 라서
        if (!params?.conversationId) {
            return '';
        }
        return params.conversationId as string;
    }, [params?.conversationId]);

    // 2. conversationId 유무에 따른 isOpen 상태
    const isOpen = useMemo(() => {
        return conversationId ? true : false;
    }, [conversationId]);
    
    return useMemo(() => ({
        isOpen,
        conversationId,
    }), [isOpen, conversationId])
};