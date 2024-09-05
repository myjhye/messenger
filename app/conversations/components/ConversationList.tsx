// 현재 사용자가 대화 중인 대화 목록 (개인, 그룹)

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
// users: 현재 사용자 제외한 모든 사용자 목록 (그룹 채팅 생성 시 모달에서 사용자 목록 조회 용도)
export default function ConversationList({ initialItems, users }: ConversationListProps) {

    // 대화 목록
    const [items, setItems] = useState(initialItems);
    // 모달 열림 (그룹 대화 생성 용도)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const session = useSession();
    const router = useRouter();
    const { conversationId, isOpen } = useConversation();

    // 현재 사용자의 이메일을 pusher 채널 키로 사용
    // 대화 생성, 메세지 업데이트, 대화 삭제 시 현재 사용자의 이메일 기반의 pusher 채널에 알림
    const pusherKey = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);


    // useEffect: 이벤트(대화 생성, 메세지 업데이트, 대화 삭제)를 ui에 즉시 반영
    useEffect(() => {
        // 현재 사용자(session.data?.user?.email)가 로그인 하지 않은 경우
        if (!pusherKey) {
            return;
        }

        // pusherKey(현재 사용자 이메일)로 채널 구독
        // 이벤트 처리(대화 생성, 메세지 업데이트, 대화 삭제)하고 알림 보내는 용도
        pusherClient.subscribe(pusherKey);

        // 새 대화 채팅방 추가 함수
        const newHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                // 이미 존재하는 대화면 아무 작업 하지 않음
                // current = conversation.id
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

        // 채팅방 내 메세지 업데이트 함수 (안녕 -> 반가워 -> 뭐하니(최신))
        const updateHandler = (conversation: FullConversationType) => {
            setItems((current) => current.map((currentConversation) => {
                // 해당 채팅 방 내에서(currentConversation.id === conversation.id) 새 메세지가 추가되거나 업데이트 될 시
                if (currentConversation.id === conversation.id) {
                    // 대화 메세지 목록을 최신 상태로 갱신
                    return {
                        ...currentConversation,
                        messages: conversation.messages
                    }
                }
                return currentConversation;
            }))
        }

        // 대화(채팅 방) 삭제 함수
        const removeHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                // 삭제된 대화(conversation.id)를 목록(convo)에서 제거
                return [...current.filter((convo) => convo.id !== conversation.id)]
            });

            // 삭제된 대화(conversation.id)가 현재 열려있는 대화(conversationId)라면 대화 목록 페이지(/conversations)로 이동
            if (conversationId === conversation.id) {
                router.push('/conversations');
            };
        };

        // pusher 이벤트 바인딩
        // 현재 사용자 이메일 기반한 pusher에 이벤트 알림 보내기 위한 핸들러(newHandler)와 이벤트(conversation:new) 바인딩
        pusherClient.bind('conversation:new', newHandler);
        pusherClient.bind('conversation:update', updateHandler);
        pusherClient.bind('conversation:remove', removeHandler);

        // 컴포넌트가 언마운트 될 시 pusher 이벤트 핸들러 해제하고 채널 구독 취소 (불필요한 메모리 사용 방지)
        return () => {
            pusherClient.unsubscribe(pusherKey);
            pusherClient.unbind('conversation:new', newHandler);
            pusherClient.unbind('conversation:update', updateHandler);
            pusherClient.bind('conversation:remove', removeHandler);
        }
    }, [pusherKey, conversationId, router]);

    return (
        <>
            {/* 그룹 채팅 생성 모달 */}
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
                        // 개별 대화 항목
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