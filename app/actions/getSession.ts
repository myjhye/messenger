// 세션의 사용자 정보 (기본 정보)

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function getSession() {
    // authOptions: 인증 설정
    return await getServerSession(authOptions);
}