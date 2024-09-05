// 현재 사용자가 마지막 메세지 조회 시 seen 배열에 사용자 id 추가

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher'
import prisma from "@/app/libs/prismadb";

interface IParams {
  conversationId?: string;
}

export async function POST(
  request: Request,
  // url 파라미터
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    // url 파라미터에서 conversationId 추출
    const { conversationId } = params;
    
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 특정 대화 조회 (마지막 메세지 가져오는 용도)
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
        // 대화 참여자 정보 포함
        users: true,
      },
    });

    if (!conversation) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    // 마지막 메세지 조회
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // * 현재 사용자가 마지막 메세지를 읽었음을 표시하기 위해 seen 배열에 추가
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id
      },
      // 추가 정보 (메세지 보낸 사용자 정보, 메세지 본 사용자 정보)
      include: {
        sender: true,
        seen: true,
      },
      // 업데이트할 데이터
      data: {
        seen: {
          connect: {
            // 현재 사용자의 id를 seen 배열에 추가
            id: currentUser.id
          }
        }
      }
    });

    // 업데이트된 메세지 정보 전송 (현재 사용자에게)
    await pusherServer.trigger(currentUser.email, 'conversation:update', {
      id: conversationId,
      messages: [updatedMessage]
    });

    // 사용자가 이미 마지막 메세지를 봤으면, 더 진행하지 않음
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    // 마지막 메세지 업데이트 알림 전송 (대화 참여자들에게)
    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    // 성공 응답 반환
    return new NextResponse('Success');
    
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES_SEEN')
    return new NextResponse('Error', { status: 500 });
  }
}