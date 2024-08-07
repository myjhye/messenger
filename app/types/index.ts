// 타입 전역 사용

import { Conversation, Message, User } from "@prisma/client"

export type FullMessageType = Message & {
    // 메세지를 보낸 사용자 정보
    sender: User,
    // 메세지를 본 사용자 정보
    seen: User[]
};

export type FullConversationType = Conversation & {
    // 대화에 포함된 사용자 목록
    users: User[],
    // 대화에 포함된 메세지 목록 (FullMessageType 타입)
    messages: FullMessageType[],
};