import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    createdAt: Date;
  };
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export function MessageBubble({ message, user }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.[0] || <User className="h-4 w-4" />}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl shadow-sm text-sm leading-relaxed prose prose-sm max-w-none",
            isUser
              ? "bg-card text-card-foreground rounded-br-md"
              : "bg-background border text-foreground rounded-bl-md"
          )}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <span className="text-xs text-muted-foreground px-2">
          {message.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
