import { BoardsListMessage } from "@/types";
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [boards, setBoards] = useState<BoardsListMessage | null>(null);
  const [status, setStatus] = useState<string>("Disconnected");
  const [winnerSessionId, setWinnerSessionId] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);
  let sock: any; // define sock here to use in onConnect

  useEffect(() => {
    if (!room) return;

    const client = new Client({
      webSocketFactory: () => {
        sock = new SockJS(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ws`);
        return sock;
      },
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        // Extract sessionId from the SockJS URL
        console.log("sock:", sock);
        const extractedId = /\/([^\/]+)\/websocket/.exec(
          sock?._transport?.url
        )?.[1];
        if (extractedId) {
          console.log("Extracted session ID:", extractedId);
          setSessionId(extractedId);
        }

        setStatus(`Joined room: ${room}`);
        client.subscribe(`/topic/room/${room}`, (msg) => {
          try {
            const message = JSON.parse(msg.body);
            if (message.type === "WIN" && message.sessionId) {
              setWinnerSessionId(message.sessionId);
              console.log("Winner session ID:", message.sessionId);
            } else {
              setBoards(message);
            }
          } catch (e) {
            // fallback: treat as boards message
            setBoards(JSON.parse(msg.body));
          }
        });
        console.log("Subscribed to topic:", `/topic/room/${room}`);
        client.publish({
          destination: `/app/room/${room}/action`,
          body: JSON.stringify({ type: "JOIN", room }),
        });
      },
      onDisconnect: () => {
        if (room && sessionId) {
          client.publish({
            destination: `/app/room/${room}/action`,
            body: JSON.stringify({ type: "LEAVE", room }),
          });
        }
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
  }, [room]);

  const sendGameAction = useCallback(
    (action: GameAction) => {
      console.log("Sending game action:", action);
      console.log("Stomp client:", stompClient.current);
      console.log("Room:", room);
      if (!stompClient.current?.connected || !room || !sessionId) return;
      stompClient.current.publish({
        destination: `/app/room/${room}/action`,
        body: JSON.stringify(action),
      });
    },
    [room, sessionId]
  );

  // Add a function to start the game
  const startGame = useCallback(() => {
    if (!room || !stompClient.current?.connected) return;
    stompClient.current.publish({
      destination: `/app/room/${room}/start`,
      body: "",
    });
  }, [room]);

  // Expose startGame for use in the UI
  (useWebSocket as any).startGame = startGame;

  // Expose stompClient ref for advanced subscriptions
  (useWebSocket as any).stompClientRef = stompClient;

  return {
    boards,
    sessionId,
    status,
    sendGameAction,
    startGame,
    winnerSessionId,
  };
}
