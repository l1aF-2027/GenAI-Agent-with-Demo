"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatHistory } from "@/components/chat/chat-history";

export default function ChatPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const handleLoadSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowHistory(false);
  };

  return (
    <div className="h-screen">
      {showHistory ? (
        <ChatHistory
          onBack={() => setShowHistory(false)}
          onLoadSession={handleLoadSession}
        />
      ) : (
        <ChatInterface
          onShowHistory={() => setShowHistory(true)}
          initialSessionId={selectedSessionId}
        />
      )}
    </div>
  );
}
