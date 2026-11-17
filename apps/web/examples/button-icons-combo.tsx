import { ButtonIcon } from "@/examples/button-icon";
import { ButtonWithIcon } from "@/examples/button-with-icon";

export function ButtonIconsCombo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <ButtonWithIcon />
      <ButtonIcon />
    </div>
  );
}
