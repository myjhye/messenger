// /users 경로와 그 하위 경로 모든 페이지에 이 레이아웃 적용

import getAllUsersExceptMe from "../actions/getAllUsersExceptMe";
import Sidebar from "../components/sidebar/Sidebar";
import UserList from "./components/UserList";

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
    
    const users = await getAllUsersExceptMe();
    
    return (
        // /user 경로의 모든 페이지에 사이드바 고정 표시
        <Sidebar>
            <div className="h-full">
                <UserList items={users} />
                {children}
            </div>
        </Sidebar>
    )
}