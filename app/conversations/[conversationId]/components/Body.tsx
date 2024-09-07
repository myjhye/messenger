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

// initialMessages: ConversationId (대화에 속한 모든 메세지)
export default function Body({ initialMessages = [] }: BodyProps) {
  // html 참조 (마지막 메세지로 스크롤 용도)
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // 대화 내 메세지 목록
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
  
  const { conversationId } = useConversation();
  
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
    // 대화가 변경될 때마다 메세지를 읽음 상태로 표시
  }, [conversationId]);


  useEffect(() => {
    // pusher 채널 구독
    pusherClient.subscribe(conversationId);

    //* 새 메세지 도착 시 실행 핸들러 (pusher)
    const messageHandler = (message: FullMessageType) => {
      // 마지막 메세지를 읽음 상태로 표시
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        // 중복 메세지 방지
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });

      // 메세지 전송 후 화면 스크롤해 화면 하단 이동
      if (message.sender.email === currentUserEmail) {
        bottomRef?.current?.scrollIntoView();
      }
    };

    //* 기존 메세지 수정 시 실행 핸들러 (pusher)
    const updateMessageHandler = (newMessage: FullMessageType) => {
      // 기존 메세지 목록(currentMessage.id)에서 수정된 메세지(newMessage.id) 찾아 업데이트
      setMessages((current) => current.map((currentMessage) => {
        if (currentMessage.id === newMessage.id) {
          // 수정된 메세지로 교체
          return newMessage;
        }
        // 다른 메세지는 그대로 유지
        return currentMessage;
      }));
    };

    //* 메세지 삭제 시 실행 핸들러 (pusher)
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

  //* 메세지 삭제 시 실행 (클라이언트)
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
          // 메세지 내용
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
