// 그룹 채팅 프로필 이미지

"use client"

import { User } from "@prisma/client"
import Image from "next/image";

interface AvatarGroupProps {
    users?: User[]
}

// users: ConversationBox (현재 사용자 포함된 대화 참여자들)
export default function AvatarGroup({ 
    users = [] 
}: AvatarGroupProps) {

    const slicedUsers = users.slice(0, 3);

    const positionMap = {
        0: 'top-0 left-[12px]',
        1: 'bottom-0',
        2: 'bottom-0 right-0'
    }

    return (
        <div className="relative h-11 w-11">
            {slicedUsers.map((user, index) => (
                <div 
                    key={user.id}
                    className={`absolute inline-block rounded-full overflow-hidden h-[21px] w-[21px] ${positionMap[index as keyof typeof positionMap]}`}
                >
                    <Image 
                        alt="Avatar"
                        fill
                        src={user?.image || '/images/placeholder.jpg'}
                    />
                </div>
            ))}
        </div>
    )
}