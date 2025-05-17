"use client";

import SudokuBoard from "@/components/sudoku-board";
import { useWebSocket } from "@/hooks/use-web-socket";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const GamePage = () => {
  const searchParams = useSearchParams();
  const roomCodeFromUrl = searchParams.get("roomCode") || "";
  const [roomCode] = useState(roomCodeFromUrl);
  const { boards, sessionId, status, sendGameAction, startGame } =
    useWebSocket(roomCode);

  // Track if the game has started (boards are present and have cells)
  const gameStarted = !!(
    boards &&
    Object.values(boards.boards).some(
      (b) =>
        Array.isArray(b) &&
        b.length > 0 &&
        Array.isArray(b[0]) &&
        b[0].length > 0
    )
  );
  console.log("boards", boards);

  // Get the list of session IDs from the backend boards object
  const sessionIds = boards ? Object.keys(boards.boards) : [];

  // Show all boards, but only allow editing for the current user's board
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
        {!gameStarted && boards?.playerCount === 2 ? (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
            onClick={startGame}
          >
            Start Game
          </button>
        ) : null}
        {boards === null ? (
          <span className="text-gray-500">Waiting for boards...</span>
        ) : boards.playerCount === 2 ? null : (
          <span className="text-gray-500">Waiting for opponent to join...</span>
        )}
      </div>
      {gameStarted && boards && (
        <div className="flex gap-12">
          {sessionIds.map((playerId) => (
            <div key={playerId}>
              <h2 className="font-semibold mb-2">
                {playerId === sessionId
                  ? "Your Board"
                  : `Player ${playerId.slice(-4)}`}
              </h2>
              <SudokuBoard
                board={boards.boards[playerId]}
                onCellInput={
                  playerId === sessionId ? sendGameAction : undefined
                }
                disabled={playerId !== sessionId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamePage;
