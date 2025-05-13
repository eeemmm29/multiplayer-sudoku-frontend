import { title } from "@/components/primitives";
import { Button, ButtonProps } from "@heroui/button";
import { button as buttonStyles } from "@heroui/theme";
import clsx from "clsx";

interface ButtonWithLabelsProps extends ButtonProps {
  labelJapanese: string;
  labelEnglish: string;
}

const ButtonWithLabels = ({
  labelJapanese,
  labelEnglish,
  className,
  ...props
}: ButtonWithLabelsProps) => (
  <Button
    className={clsx(
      buttonStyles({ color: "primary", variant: "shadow" }),
      "flex-col h-full",
      className
    )}
    {...props}
  >
    <span className={title({ size: "sm" })}>{labelJapanese}</span>
    <span className={title({ size: "sm" })}>{labelEnglish}</span>
  </Button>
);

export default ButtonWithLabels;
