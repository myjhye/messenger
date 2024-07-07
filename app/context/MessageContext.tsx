"use client";

import { createContext, useContext, useState } from 'react';

interface MessageContextType {
  editMessage: string;
  setEditMessage: (message: string) => void;
  editMessageId: string | null;  // 수정할 메시지 ID 상태 추가
  setEditMessageId: (id: string | null) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [editMessage, setEditMessage] = useState('');
  const [editMessageId, setEditMessageId] = useState<string | null>(null);  // 초기값 설정

  return (
    <MessageContext.Provider value={{ editMessage, setEditMessage, editMessageId, setEditMessageId }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
