export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private onMessage: (message: string) => void;
  private onError: (error: Event) => void;
  private onClose: () => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  constructor(
    sessionId: string,
    onMessage: (message: string) => void,
    onError: (error: Event) => void,
    onClose: () => void,
    private fastApiUrl: string = process.env.NEXT_PUBLIC_FASTAPI_URL ||
      "ws://127.0.0.1:8000"
  ) {
    this.sessionId = sessionId;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const baseUrl = this.fastApiUrl || "ws://127.0.0.1:8000";
        const wsUrl = `${baseUrl}/ws/${this.sessionId}`;
        console.log(
          "[v0] FastAPI URL from env:",
          process.env.NEXT_PUBLIC_FASTAPI_URL
        );
        console.log("[v0] Base URL used:", baseUrl);
        console.log("[v0] Full WebSocket URL:", wsUrl);
        console.log("[v0] Session ID:", this.sessionId);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(
            "[v0] WebSocket connected successfully for session:",
            this.sessionId
          );
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log("[v0] Received message from FastAPI:", event.data);
          this.onMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("[v0] WebSocket connection error:", error);
          console.error("[v0] WebSocket state:", this.ws?.readyState);
          this.onError(error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log(
            "[v0] WebSocket closed - Code:",
            event.code,
            "Reason:",
            event.reason
          );
          console.log("[v0] Was clean close:", event.wasClean);
          this.ws = null;

          // Attempt to reconnect if not a normal closure
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.reconnectAttempts++;
            console.log(
              `[v0] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
            );

            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          } else {
            this.onClose();
          }
        };
      } catch (error) {
        console.error("[v0] Failed to create WebSocket connection:", error);
        reject(error);
      }
    });
  }

  sendMessage(message: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[v0] Sending message:", message);
      this.ws.send(message);
      return true;
    } else {
      console.error("[v0] WebSocket is not connected");
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      console.log("[v0] Disconnecting WebSocket");
      this.ws.close(1000, "Normal closure");
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
