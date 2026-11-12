import { ImageResponse } from "next/og";

import { FrakmentMark } from "@/components/site/brand/frakment-mark";
import { SITE } from "@/constants/site";

export const GET = (request: Request) => {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || SITE.NAME;
  const description = searchParams.get("description") || SITE.DESCRIPTION.LONG;

  return new ImageResponse(
    <div tw="flex h-full w-full bg-black text-white">
      <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-[1px]" />
      <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-[1px]" />
      <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] top-16" />
      <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] bottom-16" />
      <div tw="flex absolute flex-row bottom-24 right-24 text-white">
        <FrakmentMark height={48} width={48} />
      </div>
      <div tw="flex flex-col absolute w-[896px] justify-center inset-32">
        <div
          style={{
            fontSize: title && title.length > 20 ? 64 : 80,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            textWrap: "balance",
          }}
          tw="text-base tracking-tight flex-grow-1 flex flex-col justify-center leading-[1.1]"
        >
          {title}
        </div>
        <div
          style={{
            fontWeight: 500,
            textWrap: "balance",
          }}
          tw="text-[40px] leading-[1.5] flex-grow-1 text-stone-400"
        >
          {description}
        </div>
      </div>
    </div>,
    {
      height: 630,
      width: 1200,
    }
  );
};
