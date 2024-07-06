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
export default function Body({ initialMessages = [] }: BodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  // 대화 목록
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
  
  const { conversationId } = useConversation();
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;

  // 메세지 읽음 상태 표시
  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // pusher로 새 메세지 업데이트 처리
  useEffect(() => {
    pusherClient.subscribe(conversationId);

    // 새 메세지 도착 시 실행
    const messageHandler = (message: FullMessageType) => {
      // 현재 메시지 읽음으로 표시
      axios.post(`/api/conversations/${conversationId}/seen`);

      // 메세지 목록 업데이트
      setMessages((current) => {
        // 현재 목록에 동일한 메세지가 이미 있는지 확인
        if (find(current, { id: message.id })) {
          // 동일한 메세지가 있으면 목록을 변경하지 않음
          return current;
        }

        // 새 메세지를 목록에 추가
        return [...current, message];
      });

      // 보낸 사람이면 하단으로 스크롤
      if (message.sender.email === currentUserEmail) {
        bottomRef?.current?.scrollIntoView();
      }
    };

    // 기존 메세지 업데이트 (기존 메세지를 새 메세지로 교체)
    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => current.map((currentMessage) => {
        if (currentMessage.id === newMessage.id) {
          return newMessage;
        }
  
        return currentMessage;
      }));
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [conversationId, currentUserEmail]);

  return ( 
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox 
          isLast={i === messages.length - 1} 
          key={message.id} 
          data={message}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
