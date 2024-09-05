// 현재 사용자 정보 (서버 세션 정보(getSessions) 사용)

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

        // 반환 값: id, email, name, image, createdAt, updatedAt
        return currentUser;

    } catch (error: any) {
        return null;
    }
}
