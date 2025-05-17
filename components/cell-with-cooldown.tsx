import { GameAction } from "@/hooks/use-web-socket";
import { Cell } from "@/types";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface CellWithCooldownProps {
  selected: { row: number; col: number } | null;
  cell: Cell;
  rIdx: number;
  cIdx: number;
  disabled?: boolean;
  cellRefs: React.RefObject<(HTMLInputElement | HTMLSpanElement | null)[][]>;
  onCellInput?: (action: GameAction) => void;
  setSelected: (selected: { row: number; col: number }) => void;
  handleKeyDown: (e: React.KeyboardEvent, rIdx: number, cIdx: number) => void;
  cooldownUntil: number;
}

const CellWithCooldown: React.FC<CellWithCooldownProps> = ({
  selected,
  cell,
  rIdx,
  cIdx,
  disabled,
  cellRefs,
  onCellInput,
  setSelected,
  handleKeyDown,
  cooldownUntil,
}) => {
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now()); // trigger rerender
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const remaining = cooldownUntil - Date.now();
  const isOnCooldown = remaining > 0;

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

  return (
    <td
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
      {cell.status === "GIVEN" || cell.status === "CORRECT_GUESS" ? (
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
        <>
          <input
            type="number"
            min={1}
            max={9}
            value={cell.value && cell.value !== 0 ? cell.value : ""}
            disabled={disabled || isOnCooldown}
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
        </>
      )}
    </td>
  );
};

export default CellWithCooldown;
