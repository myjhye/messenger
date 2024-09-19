// 새 메세지 저장
// 기존 메세지 수정

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher';
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const {
      // 수정할 메시지 id
      messageId, 
      // 메세지 내용 (텍스트 메세지)
      message,
      // 이미지 메세지
      image,
      // 해당 메세지가 속한 대화 id
      conversationId
    } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let newMessage;

    // 1. 기존 메시지를 수정 (messageId가 있으면)
    if (messageId) {
      newMessage = await prisma.message.update({
        where: {
          // 수정할 메세지 id 
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

    // 2. 새로운 메시지 생성 (messageId가 없으면)
    } else {
      newMessage = await prisma.message.create({
        include: {
          seen: true,
          sender: true,
        },
        data: {
          body: message,
          image: image,
          // 해당 대화(conversation)에 메세지(message)를 연결
          conversation: {
            connect: {
              id: conversationId,
            },
          },
          // 메세지 보낸 사람(sender)을 현재 사용자(currentUser.id)에 연결
          sender: {
            connect: {
              id: currentUser.id,
            },
          },
          // 메세지 보낸 사람을 바로 seen 목록에 추가 (발신자는 메세지를 바로 본 것으로 간주)
          seen: {
            connect: {
              id: currentUser.id,
            },
          },
        },
      });
    }

    // 3. 메세지 추가 후 대화 상태 업데이트 (새 메세지로 lastMessageAt 업데이트)
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        // lastMessageAt 업데이트 (대화의 마지막 메세지 시간을 현재 시간으로 업데이트)
        lastMessageAt: new Date(),
        messages: {
          connect: {
            // 새 메세지나 수정된 메세지를 대화에 연결
            id: newMessage.id,
          },
        },
      },
      // 포함되는 정보 (모든 대화 참여자들, 메세지 본 사용자들)
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    // 4. 해당 대화의 참여자들에게 새 메세지 생성 또는 기존 메세지 업데이트 알림 보내기
    // 새 메세지나 변경된 메세지 반영
    await pusherServer.trigger(
      conversationId, 
      messageId 
        ? 'message:update' 
        : 'messages:new', newMessage
    );

    // 대화 마지막 메세지
    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    // 5. 해당 대화 참여자들에게 대화 목록 업데이트 이벤트 알림 보내기
    // 대화 목록 상태 업데이트 (마지막 메세지를 화면에 반영)
    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        // 모든 대화 참여자들에게 업데이트된 마지막 메세지 전달
        messages: [lastMessage],
      });
    });
    
    return NextResponse.json(newMessage);
  
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Error', { status: 500 });
  }
}
