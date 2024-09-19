// 세션 정보 (서버) <-> useSession (클라이언트 세션 정보)
// 세션 유무 확인용

import { getServerSession } from "next-auth";
import { authOptions } from "../libs/authOptions";

export default async function getSession() {
    return await getServerSession(authOptions);
}