import { GameAction } from "@/hooks/use-web-socket";
import { Cell } from "@/types";
import clsx from "clsx";

const SudokuBoard = ({
  board,
  onCellInput,
  disabled,
}: {
  board: Cell[][];
  onCellInput?: (action: GameAction) => void;
  disabled?: boolean;
}) => {
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
    <table className="border-collapse">
      <tbody>
        {board?.map((row, rIdx) => (
          <tr key={rIdx}>
            {row?.map((cell, cIdx) => (
              <td
                key={cIdx}
                className={clsx(
                  "border border-gray-700 w-10 h-10 text-center",
                  cellStatusToColor(cell.status),
                  {
                    "border-l-4": cIdx % 3 === 0,
                    "border-t-4": rIdx % 3 === 0,
                    "border-r-4": cIdx === 8,
                    "border-b-4": rIdx === 8,
                  }
                )}
              >
                {cell.status === "GIVEN" ? (
                  <span>{cell.value}</span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={cell.value === 0 ? "" : cell.value}
                    disabled={disabled || cell.status === "CORRECT_GUESS"}
                    onChange={(e) => {
                      if (onCellInput) {
                        const val = parseInt(e.target.value, 10);
                        if (e.target.value === "" || isNaN(val)) {
                          // Allow clearing the cell (backspace/delete)
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
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                    className="w-8 h-8 text-center border-none bg-transparent appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // disables arrows in Chrome/Safari/Edge
                    inputMode="numeric" // disables arrows in mobile browsers
                    pattern="[0-9]*" // disables arrows in some browsers
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SudokuBoard;
