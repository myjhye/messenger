// prisma 인스턴스 전역 사용

import { PrismaClient } from "@prisma/client/extension";

declare global {
    var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'production') {
    globalThis.prisma = client;
}

export default client;