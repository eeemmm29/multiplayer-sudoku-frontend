import { GameAction } from "@/hooks/use-web-socket";
import { Cell } from "@/types";
import { useEffect, useRef, useState } from "react";
import CellWithCooldown from "./cell-with-cooldown";

const SudokuBoard = ({
  board,
  onCellInput,
  disabled,
  removalMode,
  boardSessionId,
  mySessionId,
}: {
  board: Cell[][];
  onCellInput?: (action: GameAction) => void;
  disabled?: boolean;
  removalMode?: boolean;
  boardSessionId: string;
  mySessionId: string;
}) => {
  // Track selected cell
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null
  );
  // Refs for all cells
  const cellRefs = useRef<(HTMLInputElement | HTMLSpanElement | null)[][]>([]);

  // Initialize refs
  useEffect(() => {
    cellRefs.current = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => cellRefs.current?.[r]?.[c] || null)
    );
  }, [board]);

  // Focus selected cell
  useEffect(() => {
    if (selected) {
      // Defer focus to after DOM update
      setTimeout(() => {
        const ref = cellRefs.current[selected.row]?.[selected.col];
        if (ref) ref.focus();
      }, 0);
    }
  }, [selected, board]);

  // Handle key navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    rIdx: number,
    cIdx: number
  ) => {
    let nextRow = rIdx;
    let nextCol = cIdx;
    // Copy cell value to clipboard only on Ctrl+C or Cmd+C
    if ((e.key === "c" || e.key === "C") && (e.ctrlKey || e.metaKey)) {
      const value = board[rIdx][cIdx].value;
      if (value) {
        navigator.clipboard.writeText(String(value));
      }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      nextRow = rIdx > 0 ? rIdx - 1 : 8;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nextRow = rIdx < 8 ? rIdx + 1 : 0;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextCol = cIdx > 0 ? cIdx - 1 : 8;
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextCol = cIdx < 8 ? cIdx + 1 : 0;
    } else {
      return;
    }
    setSelected({ row: nextRow, col: nextCol });
  };

  // Custom onCellInput for removal mode to always include correct sessionId
  const handleCellInput = (action: GameAction) => {
    if (removalMode && onCellInput && action.type === "REMOVE") {
      onCellInput({ ...action, sessionId: boardSessionId });
    } else if (onCellInput && action.type === "FILL") {
      onCellInput({ ...action, sessionId: mySessionId });
    }
  };

  return (
    <table className="border-collapse">
      <tbody>
        {board?.map((row, rIdx) => (
          <tr key={rIdx}>
            {row?.map((cell, cIdx) => (
              <CellWithCooldown
                key={cIdx}
                selected={selected}
                cell={cell}
                rIdx={rIdx}
                cIdx={cIdx}
                disabled={disabled}
                cellRefs={cellRefs}
                onCellInput={handleCellInput}
                setSelected={setSelected}
                handleKeyDown={handleKeyDown}
                cooldownUntil={cell.cooldownUntil!}
                removalMode={removalMode}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SudokuBoard;
