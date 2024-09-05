// 새 메세지 저장

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher';
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const {
      // 수정할 메시지의 ID
      messageId,  
      message,
      image,
      conversationId
    } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let newMessage;

    // 1. 기존 메시지를 수정
    if (messageId) {
      newMessage = await prisma.message.update({
        where: { 
          id: messageId 
        },
        data: {
          body: message,
          image: image,
          // 수정 상태 추가
          edited: true,  
        },
        include: {
          seen: true,
          sender: true,
        },
      });

    // 2. 새로운 메시지 생성
    } else {
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
          // 메세지 보낸 사람을 바로 seen 목록에 추가 (발신자는 메세지 바로 본 것으로 간주)
          seen: {
            connect: {
              id: currentUser.id,
            },
          },
        },
      });
    }

    // 대화 상태 업데이트 (lastMessageAt 업데이트 -> 새로운 메세지 연결)
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        // lastMessageAt 업데이트
        lastMessageAt: new Date(),
        messages: {
          connect: {
            // 새로운 메세지 연결
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

    // 새 메세지가 생성되거나 기존 메세지가 업데이트 될 때 pusher로 해당 대화의 모든 클라이언트에게 실시간 알림 보내기
    await pusherServer.trigger(
      conversationId, 
      messageId 
        ? 'message:update' 
        : 'messages:new', newMessage
    );

    // 대화 마지막 메세지
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
