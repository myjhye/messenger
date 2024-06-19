// 세션의 사용자 정보

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function getSession() {
    return await getServerSession(authOptions);
}