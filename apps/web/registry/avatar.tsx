"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

function useImageLoadingStatus(
  src: string | undefined,
  referrerPolicy: React.HTMLAttributeReferrerPolicy | undefined
): ImageLoadingStatus {
  const [status, setStatus] = React.useState<ImageLoadingStatus>("idle");

  React.useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }
    let isMounted = true;
    const image = new window.Image();
    const update = (next: ImageLoadingStatus) => () => {
      if (isMounted) {
        setStatus(next);
      }
    };
    setStatus("loading");
    image.onload = update("loaded");
    image.onerror = update("error");
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    image.src = src;
    return () => {
      isMounted = false;
    };
  }, [src, referrerPolicy]);

  return status;
}

interface AvatarContextValue {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function useAvatarContext(component: string): AvatarContextValue {
  const ctx = React.useContext(AvatarContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Avatar`);
  }
  return ctx;
}

type AvatarProps = React.ComponentProps<"span"> & {
  size?: "default" | "sm" | "lg";
};

function Avatar({
  className,
  size = "default",
  children,
  ...props
}: AvatarProps) {
  const [imageLoadingStatus, setImageLoadingStatus] =
    React.useState<ImageLoadingStatus>("idle");
  const ctxValue = React.useMemo<AvatarContextValue>(
    () => ({
      imageLoadingStatus,
      onImageLoadingStatusChange: setImageLoadingStatus,
    }),
    [imageLoadingStatus]
  );
  return (
    <AvatarContext.Provider value={ctxValue}>
      <span
        className={cn(
          "group/avatar after:border-border relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
          className
        )}
        data-size={size}
        data-slot="avatar"
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
}

type AvatarImageProps = React.ComponentProps<"img"> & {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
};

function AvatarImage({
  alt,
  className,
  onLoadingStatusChange,
  referrerPolicy,
  src,
  ...props
}: AvatarImageProps) {
  const { onImageLoadingStatusChange } = useAvatarContext("AvatarImage");
  const isStringSrc = typeof src === "string";
  const imageLoadingStatus = useImageLoadingStatus(
    isStringSrc ? src : undefined,
    referrerPolicy
  );

  React.useEffect(() => {
    onImageLoadingStatusChange(imageLoadingStatus);
  }, [imageLoadingStatus, onImageLoadingStatusChange]);

  React.useEffect(() => {
    onLoadingStatusChange?.(imageLoadingStatus);
  }, [imageLoadingStatus, onLoadingStatusChange]);

  if (isStringSrc && imageLoadingStatus !== "loaded") {
    return null;
  }

  return (
    <img
      alt={alt}
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      data-slot="avatar-image"
      referrerPolicy={referrerPolicy}
      src={src}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  const { imageLoadingStatus } = useAvatarContext("AvatarFallback");
  if (imageLoadingStatus === "loaded") {
    return null;
  }
  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground data-[status=error]:bg-destructive flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs data-[status=error]:text-white",
        className
      )}
      data-slot="avatar-fallback"
      data-status={imageLoadingStatus}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      data-slot="avatar-badge"
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/avatar-group *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      data-slot="avatar-group"
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      data-slot="avatar-group-count"
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  type AvatarImageProps,
};
