// 메세지 삭제

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
  try {
    const currentUser = await getCurrentUser();
    const { messageId } = params;
    const { conversationId } = await request.json();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return new NextResponse('Message not found', { status: 404 });
    }

    if (message.senderId !== currentUser.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 메시지를 삭제하기 전에 관계를 해제합니다.
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

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

    await prisma.message.delete({
      where: { id: messageId },
    });

    await pusherServer.trigger(conversationId, 'message:delete', { messageId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error, 'ERROR_DELETE_MESSAGE');
    return new NextResponse('Error', { status: 500 });
  }
}
