// 개별 대화 항목
// 대화의 마지막 메세지, 상대방 아바타, 대화 이름.. 표시하고 클릭 시 해당 대화로 이동

import Avatar from "@/app/components/Avatar";
import useOtherUser from "@/app/hooks/useOtherUser"
import { FullConversationType } from "@/app/types"
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import AvatarGroup from "@/app/components/AvatarGroup";

interface ConversationBoxProps {
    // 대화 데이터
    data: FullConversationType,
    // 선택 여부
    selected: boolean,
};

// props: ConversationList
// data: 대화 항목들
export default function ConversationBox({ data, selected }: ConversationBoxProps) {
    // 상대방 대화 가져오기
    const otherUser = useOtherUser(data);
    // 현재 세션 정보
    const session = useSession();
    const router = useRouter();

    // 대화 박스 클릭 시 실행
    const handleClick = useCallback(() => {
        // 대화 페이지로 이동
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    // 대화의 마지막 메세지 가져오기
    const lastMessage = useMemo(() => {
        const messages = data.messages || [];
        // 메세지 배열의 마지막 메세지 반환
        return messages[messages.length - 1];
    }, [data.messages]);

    // 현재 사용자 이메일 가져오기
    const userEmail  = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    // 마지막 메세지를 사용자가 읽었는지 확인
    const hasSeen = useMemo(() => {
        if (!lastMessage) {
            // 마지막 메세지가 없으면 false 반환
            return false;
        }

        // 메세지를 본 사용자 배열
        const seenArray = lastMessage.seen || [];

        if (!userEmail) {
            // 사용자 이메일이 없으면 false 반환
            return false;
        }

        // 현재 사용자가 메세지를 봤는지 확인
        return seenArray
            .filter((user) => user.email === userEmail).length !== 0;
    
    }, [userEmail, lastMessage]);


    // 마지막 메세지의 텍스트 내용
    const lastMessageText = useMemo(() => {
        // 이미지가 있으면 'Sent an image' 반환
        if (lastMessage?.image) {
            return 'Sent an image';
        }
        // 메세지 본문이 있으면 본문 반환
        if (lastMessage?.body) {
            return lastMessage.body;
        }
        // 둘 다 없으면 'Started a conversation' 반환
        return "Started a conversation";
    }, [lastMessage]);

    return (
        <div 
            onClick={handleClick}
            className={clsx(`w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3`, selected ? 'bg-neutral-100' : 'bg-white')}
        >
            {data.isGroup ? (
                <AvatarGroup users={data.users} />
            ) : (
                // 대화에서 상대방 아바타
                <Avatar user={otherUser} />
            )}
            <div className="min-w-0 flex-1">
                <div className="focus-outline-none">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-md font-medium text-gray-900">
                            {/* 대화 이름 또는 상대방 이름 */}
                            {data.name || otherUser.name}
                        </p>
                        {lastMessage?.createdAt && (
                            <p className="text-xs text-gray-400 font-light">
                                {/* 마지막 메세지 시간 */}
                                {format(new Date(lastMessage.createdAt), 'p')}
                            </p>
                        )}
                    </div>
                    <p className={clsx(`truncate text-sm`, hasSeen ? 'text-gray-500' : 'text-black font-medium')}>
                        {/* 마지막 메세지 텍스트 */}
                        {lastMessageText}
                    </p>
                </div>
            </div>
        </div>
    )
}