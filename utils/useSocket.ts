import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";

export function useSocket(onConnect?: (client: Client) => void) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS(process.env.NEXT_PUBLIC_BACKEND_URL + "/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
    });
    clientRef.current = client;
    client.onConnect = () => {
      if (onConnect) onConnect(client);
    };
    client.activate();
    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [onConnect]);

  return clientRef;
}
