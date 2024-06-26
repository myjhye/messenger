// 대화 본문

"use client"

import useConversation from "@/app/hooks/useConversation";
import { FullMessageType } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import axios from "axios";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface BodyProps {
    initialMessages: FullMessageType[],
}

export default function Body({ initialMessages }: BodyProps) {
    const [messages, setMessages] = useState(initialMessages);
    const bottomRef = useRef<HTMLDivElement>(null);

    const { conversationId } = useConversation();

    useEffect(() => {
        axios.post(`/api/conversations/${conversationId}/seen`);
    }, [conversationId]);

    useEffect(() => {
        pusherClient.subscribe(conversationId);
        bottomRef?.current?.scrollIntoView();

        const messageHandler = (newMessage: FullMessageType) => {
            setMessages((current) => {
                if (find(current, { id: newMessage.id })) {
                    return current;
                }
                return [...current, newMessage];
            });
            bottomRef?.current?.scrollIntoView();
        };

        pusherClient.bind('message:new', messageHandler);

        return () => {
            console.log('Unsubscribing from Pusher channel:', conversationId);
            pusherClient.unsubscribe(conversationId);
            pusherClient.unbind('message:new', messageHandler);
        };
    }, [conversationId]);

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
