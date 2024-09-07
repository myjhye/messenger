// 대화 메세지 검색 (사용자가 입력한 검색어 기반)
// 관련 메세지 목록 클라이언트에 반환

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import OpenAI from 'openai';
import getCurrentUser from '@/app/actions/getCurrentUser';

// openai 인스턴스
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// searchTerm: 검색어
// messageContent: 사용자가 참여한 대화 내 메세지 전체 목록
async function evaluateMessage(searchTerm: string, messageContent: string): Promise<boolean> {

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
        // 검색어가 메세지와 관련 있는지 평가 (true/false)
        content: `
          You are a helpful assistant. Determine if the following message is discussing the topic: "${searchTerm}".
          Reply with "true" if it is related to the topic, otherwise reply with "false".
        `,
      },
      {
        role: "user",
        // 검색어와 비교할 사용자 메세지 목록
        content: messageContent,
      },
    ],
    max_tokens: 10,
  });

  const responseContent = completion.choices[0]?.message?.content?.trim().toLowerCase();
  return responseContent === 'true';
}


export async function POST(req: NextRequest) {
  // 사용자가 입력한 검색어
  const { searchTerm } = await req.json();
  
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    //* 현재 사용자가 참여한 모든 대화 조회
    const userConversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: currentUser.id,
          },
        },
      },
      include: {
        messages: {
          include: {
            // 각 메세지의 발신자 정보 포함
            sender: true,
          },
        },
      },
    });

    //* 검색된 대화 내 모든 메세지 조회
    const messages = userConversations.flatMap(conversation => conversation.messages);

    const relatedMessages: any[] = [];
    //* GPT로 각 메시지가 검색어와 관련이 있는지 평가(evaluateMessage)
    for (const message of messages) {
      if (message.body && await evaluateMessage(searchTerm, message.body)) {
        //* 관련 메세지들(message.body)을 관련 메세지 목록(relatedMessages)에 추가
        relatedMessages.push({
          // 메세지 내용
          body: message.body,
          // 발신자 이름
          senderName: message.sender.name,
          // 메세지 생성 시간
          createdAt: message.createdAt,
          // 대화 id
          conversationId: message.conversationId, 
        });
      }
    }
    // 검색된 관련 메세지들 클라이언트에 반환 (json 형태)
    return NextResponse.json(relatedMessages);
  } catch (error) {
    console.error('Error searching messages:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}