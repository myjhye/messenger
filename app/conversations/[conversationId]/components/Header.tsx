// 대화 헤더 - 대화 제목, 상대방 아바타, 상태 정보(active)

"use client"

import Avatar from "@/app/components/Avatar"
import useOtherUser from "@/app/hooks/useOtherUser"
import { Conversation, User } from "@prisma/client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { HiChevronLeft } from "react-icons/hi"
import { HiEllipsisHorizontal } from "react-icons/hi2"
import ProfileDrawer from "./ProfileDrawer"
import AvatarGroup from "@/app/components/AvatarGroup"

interface HeaderProps {
    conversation: Conversation & {
        users: User[]
    }
};

// props: ConversationId
// conversation: 특정 대화 정보
export default function Header({ conversation }: HeaderProps) {

    // 나를 제외한 대화 참여자들 조회
    const otherUser = useOtherUser(conversation);
    // ProfileDrawer 열기 여부
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // 대화가 그룹인지 여부에 따라 다른 텍스트 표시 - 3 members, Active
    const statusText = useMemo(() => {
        if (conversation.isGroup) {
            return `${conversation.users.length} members`;
        }

        return 'Active';
    }, []);

    return (
        <>
            <ProfileDrawer 
                data={conversation}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
            <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
                <div className="flex gap-3 item-center">
                    {/* lg:hidden: 모바일 화면에서만 표시 */}
                    {/* 뒤로가기 버튼: /conversations로 이동 */}
                    <Link
                        className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer" 
                        href="/conversations"
                    >
                        <HiChevronLeft size={32} />
                    </Link>
                    {conversation.isGroup ? (
                        <AvatarGroup users={conversation.users} />
                    ) : (
                        // 대화에서 상대방 아바타
                        <Avatar user={otherUser} />
                    )}
                    <div className="flex flex-col">
                        <div>
                            {conversation.name || otherUser.name}
                        </div>
                        <div className="text-sm font-light text-neutral-500">
                            {statusText}
                        </div>
                    </div>
                </div>
                {/* 클릭 시 ProfileDrawer 열기 */}
                <HiEllipsisHorizontal 
                    size={32}
                    onClick={() => setDrawerOpen(true)}
                    className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
                />
            </div>
        </>
    )
}