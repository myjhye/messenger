// 대화 목록
// 사용자 목록
// 사이드바

import React from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ConversationList from "./components/ConversationList";
import getConversations from "../actions/getConversations";
import getAllUsersExceptMe from "../actions/getAllUsersExceptMe";

export default async function ConversationsLayout({ children }: { children: React.ReactNode }) {

    // 대화 목록
    const conversations = await getConversations();
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