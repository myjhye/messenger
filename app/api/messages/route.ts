// 새로운 메세지를 데이터베이스에 저장
// 대화의 상태 업데이트

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher';
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const {
      messageId,  // 수정할 메시지의 ID
      message,
      image,
      conversationId
    } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let newMessage;

    if (messageId) {
      // 기존 메시지를 수정
      newMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          body: message,
          image: image,
          edited: true,  // 수정 상태 추가
        },
        include: {
          seen: true,
          sender: true,
        },
      });
    } else {
      // 새로운 메시지 생성
      newMessage = await prisma.message.create({
        include: {
          seen: true,
          sender: true,
        },
        data: {
          body: message,
          image: image,
          conversation: {
            connect: {
              id: conversationId,
            },
          },
          sender: {
            connect: {
              id: currentUser.id,
            },
          },
          seen: {
            connect: {
              id: currentUser.id,
            },
          },
        },
      });
    }

    // 대화 상태 업데이트
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    await pusherServer.trigger(conversationId, messageId ? 'message:update' : 'messages:new', newMessage);

    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        messages: [lastMessage],
      });
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Error', { status: 500 });
  }
}
