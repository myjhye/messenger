// 사용자가 입력한 검색어를 기반으로 대화 메세지 검색

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import OpenAI from 'openai';
import getCurrentUser from '@/app/actions/getCurrentUser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. 클라이언트가 검색 요청 보내기

async function evaluateMessage(searchTerm: string, messageContent: string): Promise<boolean> {

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
        // 검색어가 메세지와 관련 있는지 평가
        content: `
          You are a helpful assistant. Determine if the following message is discussing the topic: "${searchTerm}".
          Reply with "true" if it is related to the topic, otherwise reply with "false".
        `,
      },
      {
        role: "user",
        content: messageContent,
      },
    ],
    max_tokens: 10,
  });

  const responseContent = completion.choices[0]?.message?.content?.trim().toLowerCase();
  return responseContent === 'true';
}

export async function POST(req: NextRequest) {
  // 2. 검색어 추출
  const { searchTerm } = await req.json();
  
  try {
    // 3. 현재 사용자 정보 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 4. 사용자가 참여한 대화를 데이터베이스에서 검색
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

    // 5. 모든 메세지 수집
    const messages = userConversations.flatMap(conversation => conversation.messages);

    // 6. 메세지 평가 준비
    const relatedMessages: any[] = [];
    // 7. GPT를 사용하여 각 메시지가 검색어와 관련이 있는지 평가
    for (const message of messages) {
      // 메시지가 null이 아닌지 확인
      if (message.body && await evaluateMessage(searchTerm, message.body)) {
        relatedMessages.push({
          // 메세지 내용
          body: message.body,
          // 발신자 이름
          senderName: message.sender.name,
          // 메세지 생성 시간
          createdAt: message.createdAt,
          // 대화 ID
          conversationId: message.conversationId, 
        });
      }
    }
    // 8. 평가된 메세지 반환
    return NextResponse.json(relatedMessages);
  } catch (error) {
    console.error('Error searching messages:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}