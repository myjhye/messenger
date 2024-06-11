// /users 경로와 그 하위 경로 모든 페이지에 이 레이아웃 적용

import Sidebar from "../components/sidebar/Sidebar";

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
    return (
        // /user 경로의 모든 페이지에 사이드바 고정 표시
        <Sidebar>
            <div className="h-full">
                {children}
            </div>
        </Sidebar>
    )
}