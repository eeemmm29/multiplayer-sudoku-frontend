import { GameAction } from "@/hooks/use-web-socket";
import { Cell } from "@/types";
import clsx from "clsx";
import { useRef, useState, useEffect } from "react";

const SudokuBoard = ({
  board,
  onCellInput,
  disabled,
}: {
  board: Cell[][];
  onCellInput?: (action: GameAction) => void;
  disabled?: boolean;
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

  // Real-time cooldown update: force re-render every 200ms if any cell is on cooldown
  const [, forceRerender] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const checkCooldown = () =>
      board.some((row) =>
        row.some(
          (cell) => cell.cooldownUntil && cell.cooldownUntil > Date.now()
        )
      );
    if (checkCooldown()) {
      interval = setInterval(() => {
        forceRerender((n) => n + 1); // force re-render
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [board]);

  const cellStatusToColor = (status: string) => {
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
  };

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

  return (
    <table className="border-collapse">
      <tbody>
        {board?.map((row, rIdx) => (
          <tr key={rIdx}>
            {row?.map((cell, cIdx) => {
              const now = Date.now();
              const isOnCooldown = Boolean(
                cell.cooldownUntil && cell.cooldownUntil > now
              );
              return (
                <td
                  key={cIdx}
                  className={clsx(
                    "border border-gray-700 w-10 h-10 text-center relative",
                    cellStatusToColor(cell.status),
                    {
                      "border-l-4": cIdx % 3 === 0,
                      "border-t-4": rIdx % 3 === 0,
                      "border-r-4": cIdx === 8,
                      "border-b-4": rIdx === 8,
                      "outline outline-2 outline-blue-400":
                        selected?.row === rIdx && selected?.col === cIdx,
                      "opacity-60": isOnCooldown,
                    }
                  )}
                  onClick={() => setSelected({ row: rIdx, col: cIdx })}
                >
                  {cell.status === "GIVEN" ||
                  cell.status === "CORRECT_GUESS" ? (
                    <span
                      tabIndex={0}
                      ref={(el) => {
                        cellRefs.current[rIdx] = cellRefs.current[rIdx] || [];
                        cellRefs.current[rIdx][cIdx] = el;
                      }}
                      onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                      className="outline-none cursor-pointer select-none block w-8 h-8 leading-8 mx-auto"
                      aria-label={`Cell ${rIdx + 1}, ${cIdx + 1}, value ${cell.value}`}
                    >
                      {cell.value !== 0 ? cell.value : ""}
                    </span>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={9}
                        value={cell.value && cell.value !== 0 ? cell.value : ""}
                        disabled={Boolean(disabled || isOnCooldown)}
                        ref={(el) => {
                          cellRefs.current[rIdx] = cellRefs.current[rIdx] || [];
                          cellRefs.current[rIdx][cIdx] = el;
                        }}
                        onFocus={() => setSelected({ row: rIdx, col: cIdx })}
                        onChange={(e) => {
                          if (onCellInput) {
                            const val = parseInt(e.target.value, 10);
                            if (e.target.value === "" || isNaN(val)) {
                              onCellInput({
                                row: rIdx,
                                col: cIdx,
                                value: 0,
                                type: "REMOVE",
                              });
                            } else if (val >= 1 && val <= 9) {
                              onCellInput({
                                row: rIdx,
                                col: cIdx,
                                value: val,
                                type: "FILL",
                              });
                            }
                          }
                        }}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                        className="w-8 h-8 text-center border-none bg-transparent appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {isOnCooldown && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 pointer-events-none text-xs text-gray-500">
                          ⏳
                        </div>
                      )}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SudokuBoard;
