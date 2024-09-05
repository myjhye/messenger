// 미들웨어 (인증된 사용자만 접근)
// layout에 정의할 필요 없이 파일 정의만 해도 자동 적용

import { withAuth } from "next-auth/middleware";

export default withAuth({
    // 인증되지 않으면 홈으로 이동
    pages: {
        signIn: "/"
    }
});

export const config = {
    // 미들웨어 적용되는 경로
    matcher: [
        "/users/:path*",
        "/conversations/:path*",
    ]
}