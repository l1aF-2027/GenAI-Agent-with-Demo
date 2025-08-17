"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

interface ChatInterfaceProps {
  onShowHistory: () => void;
  initialSessionId?: string | null;
}

export function ChatInterface({
  onShowHistory,
  initialSessionId = null,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    initialSessionId
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("[v0] Environment check:");
    console.log(
      "[v0] NEXT_PUBLIC_FASTAPI_URL:",
      process.env.NEXT_PUBLIC_FASTAPI_URL
    );
    console.log("[v0] Current session ID:", currentSessionId);
  }, [currentSessionId]);

  const { isConnected, isConnecting, sendMessage } = useChatWebSocket({
    sessionId: currentSessionId,
    onMessage: (message: string) => {
      console.log("[v0] Received AI response:", message);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: "assistant",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // Save assistant message to database
      if (currentSessionId) {
        saveMessage(message, "assistant", currentSessionId);
      }
    },
    onError: (error) => {
      console.error("[v0] WebSocket error:", error);
      setIsLoading(false);
      toast({
        title: "Connection Error",
        description:
          "Failed to connect to AI service. Please check if your FastAPI server is running.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Load session messages if initialSessionId is provided
  useEffect(() => {
    if (initialSessionId) {
      loadSessionMessages(initialSessionId);
    }
  }, [initialSessionId]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      if (response.ok) {
        const sessionData = await response.json();
        const loadedMessages = sessionData.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }));
        setMessages(loadedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error("Error loading session messages:", error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: null, // Will be auto-generated from first message
        }),
      });

      if (response.ok) {
        const session = await response.json();
        return session.id;
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
    return null;
  };

  const saveMessage = async (
    content: string,
    role: "user" | "assistant",
    sessionId: string
  ) => {
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          role,
          chatSessionId: sessionId,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        return message;
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
    return null;
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
    } catch (error) {
      console.error("Error updating session title:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!session?.user) return;

    let sessionId = currentSessionId;

    if (!sessionId) {
      console.log("[v0] No session ID available, creating one...");
      sessionId = await createNewSession();
      if (!sessionId) {
        toast({
          title: "Error",
          description: "Failed to create new chat session.",
          variant: "destructive",
        });
        return;
      }
      setCurrentSessionId(sessionId);
      console.log("[v0] Created new session for message:", sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to database
    await saveMessage(content, "user", sessionId);

    // Update session title with first message if it's the first message
    if (messages.length === 0) {
      const title =
        content.length > 50 ? content.substring(0, 50) + "..." : content;
      await updateSessionTitle(sessionId, title);
    }

    if (isConnected) {
      console.log("[v0] Sending message via WebSocket:", content);
      const success = sendMessage(content);
      if (!success) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to send message. Please check your connection.",
          variant: "destructive",
        });
      }
    } else {
      console.log("[v0] WebSocket not connected, cannot send message");
      setIsLoading(false);
      toast({
        title: "Connection Error",
        description:
          "Not connected to AI service. Please wait for connection or try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null); // Reset session ID, will create new one when sending message
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">
            You need to be signed in to use the chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <ChatHeader user={session.user} onShowHistory={onShowHistory} />

        {/* Connection Status Bar */}
        <div className="px-4 py-2 bg-muted/30 border-b">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={isConnected ? "default" : "secondary"}
                className="gap-1"
              >
                {isConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {isConnecting
                  ? "Connecting..."
                  : isConnected
                  ? "Connected"
                  : "Disconnected"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                URL:{" "}
                {process.env.NEXT_PUBLIC_FASTAPI_URL || "ws://localhost:8000"}
              </span>
            </div>
            {!isConnected && !isConnecting && (
              <p className="text-xs text-muted-foreground">
                Make sure your FastAPI server is running at:{" "}
                {process.env.NEXT_PUBLIC_FASTAPI_URL || "ws://127.0.0.1:8000"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-semibold text-xl">
                      AI
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Welcome to AI Assistant
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Start a conversation by typing a message below. I'm here to
                    help with any questions you have.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleSendMessage("What can you help me with?")
                      }
                      disabled={isLoading}
                    >
                      What can you help me with?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage("Tell me a joke")}
                      disabled={isLoading}
                    >
                      Tell me a joke
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleSendMessage("Explain quantum computing")
                      }
                      disabled={isLoading}
                    >
                      Explain quantum computing
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Current Chat</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewChat}
                      className="gap-2 bg-transparent"
                    >
                      <RefreshCw className="h-4 w-4" />
                      New Chat
                    </Button>
                  </div>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      user={session.user}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-background border rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Add some bottom padding to ensure last message is visible above input */}
              <div className="h-4" />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Footer - Chat Input */}
      <div className="sticky bottom-0 z-10 bg-background border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
}
