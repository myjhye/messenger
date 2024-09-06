// pusher 전역 인스턴스 (서버, 클라이언트)

import PusherServer from "pusher";
import PusherClient from "pusher-js";

// 서버 인스턴스
export const pusherServer = new PusherServer({
    // !: null이나 undefined가 아님 -> 컴파일러 경고 피하기
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: "ap3",
    useTLS: true,
});

// 클라이언트 인스턴스
export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    {
        cluster: "ap3",
    },
);