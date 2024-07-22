// 대화 본문

'use client';

import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { pusherClient } from "@/app/libs/pusher";
import useConversation from "@/app/hooks/useConversation";
import MessageBox from "./MessageBox";
import { FullMessageType } from "@/app/types";
import { find } from "lodash";
import { useSession } from "next-auth/react";

interface BodyProps {
  initialMessages: FullMessageType[];
}

// props: ConversationId
// initialMessages: 특정 메세지 (개별)
export default function Body({ initialMessages = [] }: BodyProps) {
  // 마지막 메세지로 스크롤 하기 위한 참조
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
  // 현재 대화 ID 가져오는 커스텀 훅
  const { conversationId } = useConversation();
  // 현재 사용자 세션 가져오기
  const { data: session } = useSession();
  // 현재 사용자 이메일
  const currentUserEmail = session?.user?.email;

  useEffect(() => {
    // 대화가 변경될 때마다 메세지를 읽음 상태로 표시
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);


  useEffect(() => {
    // pusher 채널 구독
    pusherClient.subscribe(conversationId);

    //** 새 메세지 도착 시 실행 핸들러
    const messageHandler = (message: FullMessageType) => {
      // 메세지를 읽음 상태로 표시
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        // 중복 메세지 방지
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });

      // 메세지 발신자가 현재 사용자일 경우 스크롤을 맨 아래로 이동
      if (message.sender.email === currentUserEmail) {
        bottomRef?.current?.scrollIntoView();
      }
    };

    //** 메세지 업데이트 시 실행 핸들러
    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => current.map((currentMessage) => {
        if (currentMessage.id === newMessage.id) {
          return newMessage;
        }
        return currentMessage;
      }));
    };

    //** 메세지 삭제 시 실행 핸들러 (pusher)
    const deleteMessageHandler = ({ messageId }: { messageId: string }) => {
      setMessages((current) => current.filter((message) => message.id !== messageId));
    };

    // pusher 이벤트 바인딩
    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);
    pusherClient.bind('message:delete', deleteMessageHandler);

    // 컴포넌트 언마운트 시 이벤트 언바인딩하고 구독 취소
    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
      pusherClient.unbind('message:delete', deleteMessageHandler);
    };
  }, [conversationId, currentUserEmail]);

  //** 메세지 삭제 시 핸들러 (클라이언트)
  const handleDelete = (messageId: string) => {
    setMessages((current) => current.filter((message) => message.id !== messageId));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          // 마지막 메세지
          isLast={i === messages.length - 1}
          key={message.id}
          // 메세지
          data={message}
          // 메세지 삭제 핸들러
          onDelete={handleDelete}
        />
      ))}
      {/* 마지막 메세지로 스크롤 하기 위한 참조 */}
      <div ref={bottomRef} />
    </div>
  );
}
