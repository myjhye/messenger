// navbar 항목 (커스텀 훅: 재사용 함수)

import { usePathname } from "next/navigation"
import useConversation from "./useConversation";
import { useMemo } from "react";
import { HiChat, HiUsers, HiSearch } from "react-icons/hi";
import { signOut } from "next-auth/react";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";

export default function useRoutes() {
    // usePathname: 현재 url 경로 가져오기 <-> useParams: 현재 url에서 파라미터 추출
    const pathname = usePathname();
    const { conversationId } = useConversation();

    const routes = useMemo(() => [
        {
            label: 'Chat',
            href: '/conversations',
            icon: HiChat,
            // 경로가 '/conversation'이거나 conversationId가 있으면 true
            active: pathname === '/conversation' || (conversationId ? true : false)
        },
        {
            label: 'Users',
            href: '/users',
            icon: HiUsers,
            active: pathname === '/users',
        },
        {
            label: 'Search',
            href: '/search',
            icon: HiSearch,
            active: pathname === '/search',
        },
        {
            label: 'Logout',
            href: '#',
            onClick: () => signOut(),
            icon: HiArrowLeftOnRectangle,
        }
    ], [pathname, conversationId]);

    return routes;

}