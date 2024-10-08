// 프로필 이미지 (사이드바 하단)

"use client";

import { User } from "@prisma/client";
import Image from "next/image";

interface AvatarProps {
    user?: User | null;
}

// user: DesktopSidebar
export default function Avatar({ user }: AvatarProps) {
    return (
        <div className="relative">
            <div className="relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11">
                <Image 
                    alt="Avatar"
                    src={user?.image || '/images/placeholder.jpg'}
                    fill
                />
            </div>
                <span className="absolute block rounded-full bg-green-500 ring-2 ring-white top-0 right-0 h-2 w-2 md:h-3 md:w-3" />
        </div>
    )
}