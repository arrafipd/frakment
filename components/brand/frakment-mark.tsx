import type { SVGProps } from "react";
import { forwardRef } from "react";

export interface FrakmentMarkProps extends SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
  title?: string;
}

export const FrakmentMark = forwardRef<SVGSVGElement, FrakmentMarkProps>(
  (
    {
      color = "currentColor",
      title = "Frakment",
      size,
      width,
      height,
      ...props
    },
    ref
  ) => {
    const resolvedWidth = width ?? size ?? 32;
    const resolvedHeight = height ?? size ?? 32;

    return (
      <svg
        aria-label={title}
        fill="none"
        height={resolvedHeight}
        ref={ref}
        role="img"
        viewBox="0 0 4040 4040"
        width={resolvedWidth}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <title>{title}</title>
        <path
          d="M3109.01 2470H3106.4L3766.11 3129.71L3129.71 3766.11L2470 3106.4V4040H1570V3105.5L909.396 3766.11L273 3129.71L932.712 2470H928.184L2018.59 1379.59L3109.01 2470ZM2470 932.711L3129.71 273L3766.11 909.396L3105.5 1570H4040V2470H3307L2020 1183L2019.07 1183.92L2017.67 1182.52L730.193 2470H0V1570H933.604L273 909.396L909.396 273L1570 933.604V0H2470V932.711Z"
          fill={color}
        />
      </svg>
    );
  }
);

FrakmentMark.displayName = "FrakmentMark";

export default FrakmentMark;
