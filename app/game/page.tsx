"use client";

import { GameAction, useWebSocket } from "@/hooks/use-web-socket";
import { Cell } from "@/types";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

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
  onCellInput?: (action: GameAction) => void;
  disabled?: boolean;
}) {
  return (
    <table className="border-collapse">
      <tbody>
        {board?.map((row, rIdx) => (
          <tr key={rIdx}>
            {row?.map((cell, cIdx) => (
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
                          onCellInput({
                            row: rIdx,
                            col: cIdx,
                            value: val,
                            type: "FILL",
                          });
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
  const searchParams = useSearchParams();
  const roomCodeFromUrl = searchParams.get("roomCode") || "";
  const [roomCode] = useState(roomCodeFromUrl);
  const { boards, status, sendGameAction } = useWebSocket(roomCode);

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Multiplayer Sudoku</h1>
      <div className="flex gap-4 items-center">
        <span className="font-mono text-gray-600">Room Code:</span>
        <span className="font-mono text-lg bg-gray-100 text-black px-3 py-1 rounded select-all">
          {roomCode}
        </span>
      </div>
      {/* Opponent status message */}
      <div className="text-lg mt-2">
        {boards && boards.playerCount !== undefined ? (
          <span className="text-blue-600">
            Players in room: {boards.playerCount}
          </span>
        ) : null}
        <br />
        {!boards || !boards.opponentBoard ? (
          <span className="text-gray-500">Waiting for opponent to join...</span>
        ) : (
          <span className="text-green-600 font-semibold">
            Opponent has joined!
          </span>
        )}
      </div>
      {boards && (
        <div className="flex gap-12">
          <div>
            <h2 className="font-semibold mb-2">Your Board</h2>
            <SudokuBoard board={boards.myBoard} onCellInput={sendGameAction} />
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
