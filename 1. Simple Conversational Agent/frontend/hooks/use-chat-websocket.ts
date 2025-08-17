"use client";

import { useEffect, useRef, useState } from "react";
import { ChatWebSocket } from "@/lib/websocket";

interface UseChatWebSocketProps {
  sessionId: string | null;
  onMessage: (message: string) => void;
  onError?: (error: Event) => void;
}

export function useChatWebSocket({
  sessionId,
  onMessage,
  onError,
}: UseChatWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const currentSessionRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("[v0] WebSocket hook effect triggered");
    console.log("[v0] Session ID:", sessionId);
    console.log("[v0] Current session ref:", currentSessionRef.current);

    // If session hasn't changed, don't reconnect
    if (
      sessionId === currentSessionRef.current &&
      wsRef.current &&
      isConnected
    ) {
      console.log(
        "[v0] Session ID unchanged and connected, keeping existing connection"
      );
      return;
    }

    // Cleanup existing connection
    if (wsRef.current) {
      console.log("[v0] Cleaning up existing connection");
      wsRef.current.disconnect();
      wsRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }

    if (!sessionId) {
      console.log("[v0] No session ID provided");
      currentSessionRef.current = null;
      return;
    }

    console.log(
      "[v0] Creating new WebSocket connection for session:",
      sessionId
    );
    setIsConnecting(true);
    currentSessionRef.current = sessionId;

    const ws = new ChatWebSocket(
      sessionId,
      (message: string) => {
        console.log("[v0] WebSocket received message:", message);
        onMessage(message);
      },
      (error: Event) => {
        console.error("[v0] WebSocket error:", error);
        setIsConnected(false);
        setIsConnecting(false);
        onError?.(error);
      },
      () => {
        console.log("[v0] WebSocket closed");
        setIsConnected(false);
        setIsConnecting(false);
      }
    );

    wsRef.current = ws;

    console.log("[v0] Attempting to connect WebSocket...");
    ws.connect()
      .then(() => {
        // Only update state if this is still the current session
        if (currentSessionRef.current === sessionId) {
          console.log("[v0] WebSocket connected successfully!");
          setIsConnected(true);
          setIsConnecting(false);
        } else {
          console.log("[v0] Session changed during connect, disconnecting");
          ws.disconnect();
        }
      })
      .catch((error) => {
        console.error("[v0] Failed to connect to WebSocket:", error);
        if (currentSessionRef.current === sessionId) {
          setIsConnected(false);
          setIsConnecting(false);
        }
      });

    // Cleanup function
    return () => {
      console.log("[v0] useEffect cleanup triggered for session:", sessionId);
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [sessionId]); // Only depend on sessionId

  const sendMessage = (message: string): boolean => {
    console.log("[v0] Attempting to send message:", message);
    console.log(
      "[v0] Connection state - isConnected:",
      isConnected,
      "wsRef.current:",
      !!wsRef.current
    );

    if (wsRef.current && isConnected) {
      const result = wsRef.current.sendMessage(message);
      console.log("[v0] Send message result:", result);
      return result;
    }

    console.log("[v0] No WebSocket connection available or not connected");
    return false;
  };

  return {
    isConnected,
    isConnecting,
    sendMessage,
  };
}
