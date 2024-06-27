// 특정 대화의 대화의 마지막 메시지를 현재 사용자가 읽었음을 표시

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher'
import prisma from "@/app/libs/prismadb";

interface IParams {
  conversationId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    const {
      conversationId
    } = params;

    
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 특정 대화 조회
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            // 메시지를 본 사용자 정보 포함
            seen: true
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    // 마지막 메세지 가져오기
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // 마지막 메세지를 업데이트해 현재 사용자가 읽었음을 표시
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id
      },
      include: {
        // 메세지를 보낸 사용자 정보 포함
        sender: true,
        // 메세지를 본 사용자 정보 포함
        seen: true,
      },
      data: {
        seen: {
          connect: {
            // 현재 사용자 ID 연결
            id: currentUser.id
          }
        }
      }
    });

    // pusher로 현재 사용자에게 업데이트 알림 전송
    await pusherServer.trigger(currentUser.email, 'conversation:update', {
      id: conversationId,
      messages: [updatedMessage]
    });

    // 사용자가 이미 메세지를 봤으면 더 진행하지 않음
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    // pusher로 대화 참가자들에게 마지막 메세지 업데이트 알림 전송
    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    // 성공 응답 반환
    return new NextResponse('Success');
    
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES_SEEN')
    return new NextResponse('Error', { status: 500 });
  }
}