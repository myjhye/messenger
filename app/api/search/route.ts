import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import OpenAI from 'openai';
import getCurrentUser from '@/app/actions/getCurrentUser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function evaluateMessage(searchTerm: string, messageContent: string): Promise<boolean> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
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
  const { searchTerm } = await req.json();
  
  try {
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 사용자가 참여한 대화 검색
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
            sender: true,
          },
        },
      },
    });

    // 사용자가 참여한 대화에서 메시지 수집
    const messages = userConversations.flatMap(conversation => conversation.messages);

    // GPT를 사용하여 각 메시지가 검색어와 관련이 있는지 평가
    const relatedMessages: any[] = [];
    for (const message of messages) {
      // 메시지가 null이 아닌지 확인
      if (message.body && await evaluateMessage(searchTerm, message.body)) {
        relatedMessages.push({
          body: message.body,
          senderName: message.sender.name,
          createdAt: message.createdAt,
          conversationId: message.conversationId, // 대화 ID 추가
        });
      }
    }

    return NextResponse.json(relatedMessages);
  } catch (error) {
    console.error('Error searching messages:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
