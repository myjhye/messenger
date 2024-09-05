// 개별 대화 항목
// 대화 항목 정보 (마지막 메세지, 상대방 아바타, 대화 이름) 표시
// 클릭 시 해당 대화로 이동

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
    // 대화 항목
    data: FullConversationType,
    // 선택 여부
    selected: boolean,
};

// props: ConversationList
// data: 대화 항목들
export default function ConversationBox({ data, selected }: ConversationBoxProps) {
    // 상대방(그룹이면 그 중에 1명) 프로필 정보
    const otherUser = useOtherUser(data);
    // 현재 세션 정보
    const session = useSession();
    const router = useRouter();

    // 대화 박스 클릭 함수
    const handleClick = useCallback(() => {
        // 해당 대화 페이지로 이동
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    // 대화의 마지막 메세지 조회
    const lastMessage = useMemo(() => {
        const messages = data.messages || [];
        return messages[messages.length - 1];
    }, [data.messages]);

    // 현재 사용자 이메일 조회
    const userEmail  = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    // 마지막 메세지를 사용자가 읽었는지 확인 (true/false)
    const hasSeen = useMemo(() => {
        // 대화 메세지 없으면
        if (!lastMessage) {
            return false;
        }

        // 마지막 메세지를 본 사용자 배열(lastMessage.seen)
        const seenArray = lastMessage.seen || [];

        // 현재 사용자 미로그인 상태면
        if (!userEmail) {
            return false;
        }

        // 현재 사용자가 마지막 메세지를 봤는지 여부 (true/false)
        return seenArray
            .filter((user) => user.email === userEmail).length !== 0;
    
    }, [userEmail, lastMessage]);


    // 마지막 메세지의 텍스트 내용
    const lastMessageText = useMemo(() => {
        // 마지막 메세지가 이미지면 'Sent an image' 표시
        if (lastMessage?.image) {
            return 'Sent an image';
        }
        // 마지막 메세지가 텍스트면 해당 내용 반환
        if (lastMessage?.body) {
            return lastMessage.body;
        }
        // 둘 다(이미지, 텍스트) 없으면 'Started a conversation' 반환
        return "Started a conversation";
    }, [lastMessage]);

    return (
        <div 
            onClick={handleClick}
            className={clsx(`w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3`, 
                selected ? 'bg-neutral-100' : 'bg-white'
            )}
        >
            {data.isGroup ? (
                // 그룹 아바타
                <AvatarGroup users={data.users} />
            ) : (
                // 개인 아바타
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