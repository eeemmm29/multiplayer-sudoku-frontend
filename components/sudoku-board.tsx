import { GameAction } from "@/hooks/use-web-socket";
import { Cell } from "@/types";

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
};

export default SudokuBoard;
