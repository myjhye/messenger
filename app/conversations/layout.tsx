// 대화 페이지 레이아웃

import React from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ConversationList from "./components/ConversationList";
import getConversations from "../actions/getConversations";
import getAllUsersExceptMe from "../actions/getAllUsersExceptMe";

export default async function ConversationsLayout({ children }: { children: React.ReactNode }) {

    // 대화 목록 (현재 사용자 포함된)
    const conversations = await getConversations();

    // 현재 사용자 제외한 모든 사용자 목록 (그룹 채팅 생성 시 모달에서 사용자 목록 조회 용도)
    const users = await getAllUsersExceptMe();

    return (
        <Sidebar>
            <div className="h-full">
                <ConversationList
                    users={users} 
                    initialItems={conversations} 
                />
                { children }
            </div>
        </Sidebar>    
    )
}