// 메세지 삭제

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
  try {
    const currentUser = await getCurrentUser();
    // 클라이언트가 data.id로 전달한 url 파라미터(params)를 messageId로 받기 (경로가 messages/[messageId]/route.ts라서)
    const { messageId } = params;
    const { conversationId } = await request.json();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 삭제할 메세지 조회 (메세지 삭제 용도)
    const message = await prisma.message.findUnique({
      where: { 
        id: messageId 
      },
    });

    if (!message) {
      return new NextResponse('Message not found', { status: 404 });
    }

    // 메세지 발신자가 현재 사용자가 아닌 경우
    if (message.senderId !== currentUser.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 삭제할 메세지가 위치한 대화 조회 (대화와 메세지 간의 관계 해제 용도)
    const conversation = await prisma.conversation.findUnique({
      where: { 
        id: conversationId 
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    //* 메세지 삭제 (대화와 메세지 간의 관계 해제)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messagesIds: {
          set: conversation.messagesIds.filter((id) => id !== messageId),
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

    //* 메세지 삭제 (대화와 메세지 간의 관계 해제 후 삭제)
    await prisma.message.delete({
      where: { 
        id: messageId 
      },
    });

    // 해당 대화(conversationId)에 message:delete 이벤트를 messageId와 함께 전달
    await pusherServer.trigger(conversationId, 'message:delete', { messageId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error, 'ERROR_DELETE_MESSAGE');
    return new NextResponse('Error', { status: 500 });
  }
}
