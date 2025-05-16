import { BoardsMessage } from "@/types";
import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

export type GameActionType =
  | "FILL"
  | "REMOVE"
  | "JOIN"
  | "LEAVE"
  | "WIN"
  | "HEARTBEAT";

export interface GameAction {
  sessionId?: string;
  type: GameActionType;
  row?: number;
  col?: number;
  value?: number;
  room?: string;
}

export function useWebSocket(room: string | null) {
  const [boards, setBoards] = useState<BoardsMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<string>("Disconnected");
  const stompClient = useRef<Client | null>(null);

  // Use NEXT_PUBLIC_BACKEND_URL from env, fallback to "" (relative) if not set
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  useEffect(() => {
    if (!room) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        setStatus(`Joined room: ${room}`);
        client.subscribe(`/topic/room/${room}`, (msg) => {
          const message: BoardsMessage = JSON.parse(msg.body);
          console.log("Received message:", message);
          setBoards(message);
        });
        // Send JOIN action immediately after connecting
        if (room) {
          client.publish({
            destination: `/app/room/${room}/action`,
            body: JSON.stringify({ type: "JOIN", room }),
          });
        }
      },
      onDisconnect: () => {
        setStatus("Disconnected");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setStatus("Error");
      },
    });

    stompClient.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [room, backendUrl]);

  const sendGameAction = useCallback(
    (action: GameAction) => {
      console.log("Sending game action:", action);
      console.log("Stomp client:", stompClient.current);
      console.log("Room:", room);
      if (!stompClient.current?.connected || !room) return;
      stompClient.current.publish({
        destination: `/app/room/${room}/action`,
        body: JSON.stringify(action),
      });
    },
    [room]
  );

  // Expose stompClient ref for advanced subscriptions
  (useWebSocket as any).stompClientRef = stompClient;

  return { boards, status, sendGameAction };
}
