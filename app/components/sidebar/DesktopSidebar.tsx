// 사이드바 (데스크탑)

"use client";

import useRoutes from "@/app/hooks/useRoutes"
import { useState } from "react";
import DesktopItem from "./DesktopItem";
import { User } from "@prisma/client";
import Avatar from "../Avatar";
import SettingsModal from "./SettingsModal";

interface DesktopSidebarProps {
    currentUser: User | null
}

// currentUser: Sidebar (현재 사용자 정보)
export default function DesktopSidebar({ currentUser }: DesktopSidebarProps) {
    // navbar 항목
    const routes = useRoutes();
    // 프로필 모달 열기
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* 프로필 설정 모달 (클릭 시 호출) */}
            <SettingsModal
                currentUser={currentUser}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-y-auto lg:bg-white lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between">
                {/* 상단 */}
                <nav className="mt-4 flex flex-col justify-between">
                    <ul
                        role='list'
                        className="flex flex-col items-center space-y-1"
                    >
                        {/* navbar 항목 */}
                        {routes.map((item) => (
                            <DesktopItem
                                key={item.label}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={item.active}
                                onClick={item.onClick}
                            />
                        ))}
                    </ul>
                </nav>
                {/* 하단 */}
                <nav className="mt-4 flex flex-col justify-between items-center">
                    {/* 프로필 (클릭 시 프로필 설정 모달 호출) */}
                    <div 
                        onClick={() => setIsOpen(true)}
                        className="cursor-pointer hover:opacity-75 transtion"
                    >
                        <Avatar user={currentUser} />
                    </div>
                </nav>
            </div>
        </>
    )
}