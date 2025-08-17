import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, role, chatSessionId } = await request.json();

    if (!content || !role || !chatSessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the chat session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId: session.user.id,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        role,
        chatSessionId,
        userId: session.user.id,
      },
    });

    // Update the chat session's updatedAt timestamp
    await prisma.chatSession.update({
      where: {
        id: chatSessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
