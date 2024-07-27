"use client";

import { createContext, useContext, useState } from 'react';

interface MessageContextType {
  editMessage: string;
  setEditMessage: (message: string) => void;
  editMessageId: string | null;
  setEditMessageId: (id: string | null) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  // 수정 중인 메세지 내용
  const [editMessage, setEditMessage] = useState('');
  // 수정할 메세지 ID
  const [editMessageId, setEditMessageId] = useState<string | null>(null);

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
