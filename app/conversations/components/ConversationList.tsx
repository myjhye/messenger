// 대화 목록 (개별 채팅 방 목록)
// 새로운 그룹 채팅을 생성할 수 있는 모달 여는 버튼

"use client"

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface ConversationListProps {
    initialItems: FullConversationType[];
    users: User[];
}

// props: layout
// initialItems: 대화 항목들
// users: 현재 사용자 제외한 모든 사용자 목록 (그룹 채팅 생성 시 사용)
export default function ConversationList({ initialItems, users }: ConversationListProps) {

    // 대화 목록
    const [items, setItems] = useState(initialItems);
    // 모달 열림 (그룹 대화 생성용)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const session = useSession();
    const router = useRouter();
    const { conversationId, isOpen } = useConversation();

    // 현재 사용자의 이메일을 pusher 채널 키로 사용
    const pusherKey = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);



    useEffect(() => {
        if (!pusherKey) {
            return;
        }

        pusherClient.subscribe(pusherKey);

        // 새 대화 채팅방 추가 될 시 호출되는 핸들러 (group 1, group 2 ...)
        const newHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                // 이미 존재하는 대화면 아무 작업 하지 않음
                if (find(current, { id: conversation.id })) {
                    return current;
                }

                return [
                    // 새 대화를 기존 대화 목록 앞에 추가
                    conversation,
                    ...current,
                ];
            })
        };

        // 개별 대화 메세지가 업데이트 될 시 호출되는 핸들러 (안녕 -> 반가워 -> 뭐하니(최신))
        const updateHandler = (conversation: FullConversationType) => {
            setItems((current) => current.map((currentConversation) => {
                // 새 메세지가 추가되거나 업데이트 될 시
                if (currentConversation.id === conversation.id) {
                    return {
                        ...currentConversation,
                        // 새 메세지 목록으로 업데이트
                        messages: conversation.messages
                    }
                }
                // 변경이 없으면 그대로 반환
                return currentConversation;
            }))
        }

        // 대화(채팅 방)가 삭제될 시 호출되는 핸들러
        const removeHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                // 삭제된 대화를 목록에서 제거
                return [...current.filter((convo) => convo.id !== conversation.id)]
            });

            // 삭제된 대화가 현재 열려있는 대화라면 대화 목록 페이지로 이동
            if (conversationId === conversation.id) {
                router.push('/conversations');
            };
        };

        // pusher 이벤트 바인딩
        pusherClient.bind('conversation:new', newHandler);
        pusherClient.bind('conversation:update', updateHandler);
        pusherClient.bind('conversation:remove', removeHandler);

        // 컴포넌트가 언마운트 될 시 pusher 이벤트 핸들러 해제하고 -> 채널 구독 취소
        return () => {
            pusherClient.unsubscribe(pusherKey);
            pusherClient.unbind('conversation:new', newHandler);
            pusherClient.unbind('conversation:update', updateHandler);
            pusherClient.bind('conversation:remove', removeHandler);
        }
    }, [pusherKey, conversationId, router]);

    return (
        <>
            <GroupChatModal
                users={users} 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <aside className={clsx(`fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200`, isOpen ? 'hidden' : 'block w-full left-0')}>
                <div className="px-5">
                    <div className="flex justify-between mb-4 pt-4">
                        <div className="text-2xl font-bold text-neutral-800">
                            Messages
                        </div>
                        <div
                            onClick={() => setIsModalOpen(true)} 
                            className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
                        >
                            <MdOutlineGroupAdd size={20} />
                        </div>
                    </div>
                    {items.map((item) => (
                        <ConversationBox
                            key={item.id} 
                            data={item} 
                            selected={conversationId === item.id}
                        />
                    ))}
                </div>
            </aside>
        </>
    )
}