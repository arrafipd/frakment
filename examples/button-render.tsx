import { buttonVariants } from "@/components/ui/button";

export function ButtonRender() {
  return (
    <a
      className={buttonVariants({ size: "sm", variant: "secondary" })}
      href="#"
    >
      Login
    </a>
  );
}
