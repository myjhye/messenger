// 현재 로그인한 사용자 제외한 사용자 목록 조회

import prisma from "@/app/libs/prismadb"
import getSession from "./getSession"

export default async function getAllUsersExceptMe() {

    const session = await getSession();

    if (!session?.user?.email) {
        return [];
    }

    try {
        const users = await prisma?.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                NOT: {
                    email: session.user.email
                }
            }
        });

        return users;

    } catch (error: any) {
        return [];
    }
}