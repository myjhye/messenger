// 특정 대화의 마지막 메시지를 현재 사용자가 읽었음을 표시

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from '@/app/libs/pusher'
import prisma from "@/app/libs/prismadb";

interface IParams {
  conversationId?: string;
}

export async function POST(
  request: Request,
  // url 파라미터로 전달된 conversationId를 포함
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = params;
    
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 특정 대화 조회 (마지막 메세지 가져오는 목적)
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      // 해당 대화에 포함된 모든 메세지와 사용자도 조회
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

    //** 마지막 메세지를 업데이트해 현재 사용자가 읽었음을 표시
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id
      },
      // 관련 데이터 함께 가져오기
      include: {
        // 메세지를 보낸 사용자 정보 포함
        sender: true,
        // 메세지를 본 사용자 정보 포함
        seen: true,
      },
      // 업데이트할 데이터
      // seen에 현재 사용자 추가
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

    // pusher로 대화 참여자들에게 마지막 메세지 업데이트 알림 전송
    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    // 성공 응답 반환
    return new NextResponse('Success');
    
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES_SEEN')
    return new NextResponse('Error', { status: 500 });
  }
}