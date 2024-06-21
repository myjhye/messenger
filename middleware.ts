// 미들웨어 - 인증된 사용자만 접근

import { withAuth } from "next-auth/middleware";

export default withAuth({
    // 인증되지 않으면 홈으로 이동
    pages: {
        signIn: "/"
    }
});

export const config = {
    // 이 패턴에 매칭되는 모든 경로에 미들웨어 적용
    matcher: [
        "/users/:path*",
        "/conversations/:path*",
    ]
}