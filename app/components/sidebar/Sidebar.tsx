// 사이드바 (전체 레이아웃)

import getCurrentUser from "@/app/actions/getCurrentUser";
import DesktopSidebar from "./DesktopSidebar";
import MobileFooter from "./MobileFooter";

export default async function Sidebar({ children }: { children: React.ReactNode }) {

    // 사용자 정보 조회 (서버) <-> AuthContext (세션 유무에 따른 화면 변경 용도, 클라이언트)
    // await: 서버에서 정의된 비동기(데이터 호출) 함수 호출
    const currentUser = await getCurrentUser();

    return (
        <div className="h-full">
            {/* 데스크탑 */}
            <DesktopSidebar currentUser={currentUser} />
            {/* 모바일 반응형 */}
            <MobileFooter />
            <main className="lg:pl-20 h-full">
                {children}
            </main>
        </div>
    )
}