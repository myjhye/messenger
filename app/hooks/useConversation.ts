// 현재 url의 파라미터에서 conversationId를 추출해 전역 사용

import { useParams } from "next/navigation"
import { useMemo } from "react";

export default function useConversation() {
    const params = useParams();

    // url 파라미터에서 conversationId 추출
    // useMemo: params.conversationId 값이 변경될 때만 재계산
    const conversationId = useMemo(() => {
        if (!params?.conversationId) {
            return '';            
        }

        return params.conversationId as string;
    }, [params?.conversationId]);

    // conversationId 존재 여부에 따라 isOpen 설정
    // !!conversationId: conversationId이 빈 문자열이 아닌 경우 true 반환
    const isOpen = useMemo(() => !!conversationId, [conversationId]);

    return useMemo(() => ({
        isOpen,
        conversationId,
    }), [isOpen, conversationId])
};