"use client";

import Avatar from "@/app/components/Avatar";
import { FullMessageType } from "@/app/types";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import ImageModal from "./ImageModal";

interface MessageBoxProps {
    data: FullMessageType;
    isLast?: boolean;
}

export default function MessageBox({ data, isLast }: MessageBoxProps) {

    const session = useSession();
    const [imageModalOpen, setImageModalOpen] = useState(false);

    // 메세지 작성자 여부
    const isOwn = session?.data?.user?.email === data?.sender?.email;
    
    // 메세지를 본 사용자 리스트
    const seenList = (data.seen || [])
        // 메세지 작성자는 제외
        .filter((user) => user.email !== data?.sender?.email)
        // 사용자 이름만 추출
        .map((user) => user.name)
        // 이름을 콤마로 구분해 문자열로 만들기
        .join(', ');

        
    // 메세지 컨테이너 클래스
    const container = clsx("flex gap-3 p-4", isOwn && "justify-end");

    // 아바타 위치 클래스
    const avatar = clsx(isOwn && "order-2");

    // 메세지 본문 클래스
    const body = clsx("flex flex-col gap-2", isOwn && "items-end");

    // 메세지 클래스
    const message = clsx("text-sm w-fit overflow-hidden",
        isOwn ? "bg-sky-500 text-white" : "bg-gray-100",
        data.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
    );

    return (
        <div className={container}>
            <div className={avatar}>
                <Avatar user={data.sender} />
            </div>
            <div className={body}>
                <div className="flex items-center gap-1">
                    <div className="text-sm text-gray-500">
                        {data.sender.name}
                    </div>
                    <div className="text-xs text-gray-400">
                        {format(new Date(data.createdAt), 'p')}
                    </div>
                </div>
                <div className={message}>
                    <ImageModal 
                        src={data.image}
                        isOpen={imageModalOpen}
                        onClose={() => setImageModalOpen(false)}
                    />
                    {data.image ? (
                        <Image
                            onClick={() => setImageModalOpen(true)} 
                            alt="Image"
                            height="288"
                            width="288"
                            src={data.image}
                            className="object-cover cursor-pointer hover:scale-110 transition translate"
                        />
                    ) : (
                        <div>
                            {data.body}
                        </div>
                    )}
                </div>
                {/* 메세지를 본 사용자 리스트 */}
                {isLast && isOwn && seenList.length > 0 && (
                    <div className="text-xs font-light font-gray-500">
                        {`Seen by ${seenList}`}
                    </div>
                )}
            </div>
        </div>
    );
}
