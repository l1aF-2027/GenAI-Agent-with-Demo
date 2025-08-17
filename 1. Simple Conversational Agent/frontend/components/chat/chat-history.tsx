"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

interface ChatHistoryProps {
  onBack: () => void;
  onLoadSession?: (sessionId: string) => void;
}

export function ChatHistory({ onBack, onLoadSession }: ChatHistoryProps) {
  const { data: session } = useSession();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const response = await fetch("/api/chat/sessions");
      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(
          sessions.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
          }))
        );
      } else {
        console.error("Failed to fetch chat sessions");
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setChatSessions((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );
        toast({
          title: "Chat deleted",
          description: "The chat session has been deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the chat session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the chat session.",
        variant: "destructive",
      });
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    if (onLoadSession) {
      onLoadSession(sessionId);
      onBack();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b bg-background p-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Button>
          <div>
            <h1 className="font-semibold text-lg">Chat History</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your previous conversations
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                No chat history yet
              </h2>
              <p className="text-muted-foreground mb-4">
                Start a conversation to see your chat history here.
              </p>
              <Button onClick={onBack}>Start Chatting</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chatSessions.map((session) => (
                <Card
                  key={session.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleLoadSession(session.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">
                          {session.title || "Untitled Chat"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span>{formatDate(session.createdAt)}</span>
                          <span>{session.messageCount} messages</span>
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
 