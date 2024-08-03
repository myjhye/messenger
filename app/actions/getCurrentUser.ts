// 데이터베이스의 사용자 정보 (일반 세션 정보보다 구체적)

import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

export default async function getCurrentUser() {
    try {
        const session = await getSession();

        if (!session?.user?.email) {
            return null;
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email as string,
            },
        });

        if (!currentUser) {
            return null;
        }

        return currentUser;

    } catch (error: any) {
        return null;
    }
}
