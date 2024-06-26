// 사용자 목록 (나 제외) - 개별

"use client"

import Avatar from "@/app/components/Avatar";
import LoadingModal from "@/app/components/LoadingModal";
import { User } from "@prisma/client"
import axios from "axios";
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react";

interface UserBoxProps {
    data: User
}

export default function UserBox({ data }: UserBoxProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 클릭 핸들러
    const handleClick = useCallback(() => {
        setIsLoading(true);

        // 개인 대화 생성
        axios.post('/api/conversations', {
            // 클릭된 사용자의 id
            userId: data.id,
        })
        .then((data) => {
            // 대화 생성 후 해당 대화로 이동
            router.push(`/conversations/${data.data.id}`)
        })
        .finally(() => setIsLoading(false));
    }, [data, router]);

    return (
        <>
            {isLoading && (
                <LoadingModal />
            )}
            <div 
                onClick={handleClick}
                className="w-full relative flex items-center space-x-3 bg-white p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
            >
                <Avatar user={data} />
                <div className="min-w-0 flex-1">
                    <div className="focus:outline-none">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-gray-900">
                                {data.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}