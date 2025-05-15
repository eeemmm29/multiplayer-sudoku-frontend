"use client";

import { useSocket } from "@/utils/useSocket";
import { Client } from "@stomp/stompjs";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

// TypeScript types for the board and message
export type Cell = {
  value: number;
  status: string;
};

export type BoardsMessage = {
  myBoard: Cell[][];
  opponentBoard: Cell[][] | null;
};

function cellStatusToColor(status: string) {
  switch (status) {
    case "GIVEN":
      return "bg-gray-200 text-black";
    case "TO_GUESS":
      return "bg-yellow-100 text-gray-700";
    case "CORRECT_GUESS":
      return "bg-green-200 text-black";
    case "WRONG_GUESS":
      return "bg-red-200 text-black";
    default:
      return "";
  }
}

function SudokuBoard({
  board,
  onCellInput,
  disabled,
}: {
  board: Cell[][];
  onCellInput?: (row: number, col: number, value: number) => void;
  disabled?: boolean;
}) {
  return (
    <table className="border-collapse">
      <tbody>
        {board.map((row, rIdx) => (
          <tr key={rIdx}>
            {row.map((cell, cIdx) => (
              <td
                key={cIdx}
                className={`border w-10 h-10 text-center ${cellStatusToColor(cell.status)}`}
              >
                {cell.status === "GIVEN" ? (
                  <span>{cell.value}</span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={cell.value === 0 ? "" : cell.value}
                    disabled={disabled}
                    onChange={(e) => {
                      if (onCellInput) {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= 9) {
                          onCellInput(rIdx, cIdx, val);
                        }
                      }
                    }}
                    className="w-8 h-8 text-center border-none bg-transparent"
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function GamePage() {
  const [boards, setBoards] = useState<BoardsMessage | null>(null);
  const searchParams = useSearchParams();
  const roomCodeFromUrl = searchParams.get("roomCode") || "";
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl);
  const [connected, setConnected] = useState(false);
  const clientRef = useSocket(onConnect);

  function onConnect(client: Client) {
    if (!roomCode) return;
    // Subscribe to boards updates for this user/room
    const sub = client.subscribe(
      `/user/topic/room/${roomCode}/boards`,
      (message) => {
        const msg: BoardsMessage = JSON.parse(message.body);
        setBoards(msg);
      }
    );
    setConnected(true);
    // Send join message
    client.publish({
      destination: `/app/room/${roomCode}/start`,
      body: "{}",
    });
    return () => sub.unsubscribe();
  }

  function handleCellInput(row: number, col: number, value: number) {
    if (!clientRef.current || !connected) return;
    clientRef.current.publish({
      destination: `/app/room/${roomCode}/action`,
      body: JSON.stringify({
        type: "FILL",
        row,
        col,
        value,
      }),
    });
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Multiplayer Sudoku</h1>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={4}
          className="border p-2 rounded"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            if (!roomCode || !clientRef.current) return;
            clientRef.current.publish({
              destination: `/app/room/${roomCode}/start`,
              body: "{}",
            });
          }}
          disabled={!roomCode}
        >
          Join Room
        </button>
      </div>
      {boards && (
        <div className="flex gap-12">
          <div>
            <h2 className="font-semibold mb-2">Your Board</h2>
            <SudokuBoard board={boards.myBoard} onCellInput={handleCellInput} />
          </div>
          <div>
            <h2 className="font-semibold mb-2">Opponent's Board</h2>
            {boards.opponentBoard ? (
              <SudokuBoard board={boards.opponentBoard} disabled />
            ) : (
              <div className="text-gray-400">Waiting for opponent...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
