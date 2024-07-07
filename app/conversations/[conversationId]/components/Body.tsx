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

export default function Body({ initialMessages = [] }: BodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
  const { conversationId } = useConversation();
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });

      if (message.sender.email === currentUserEmail) {
        bottomRef?.current?.scrollIntoView();
      }
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => current.map((currentMessage) => {
        if (currentMessage.id === newMessage.id) {
          return newMessage;
        }
        return currentMessage;
      }));
    };

    const deleteMessageHandler = ({ messageId }: { messageId: string }) => {
      setMessages((current) => current.filter((message) => message.id !== messageId));
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);
    pusherClient.bind('message:delete', deleteMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
      pusherClient.unbind('message:delete', deleteMessageHandler);
    };
  }, [conversationId, currentUserEmail]);

  const handleDelete = (messageId: string) => {
    setMessages((current) => current.filter((message) => message.id !== messageId));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
          onDelete={handleDelete}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
