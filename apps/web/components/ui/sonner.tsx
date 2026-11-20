"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import ReactDOM from "react-dom";
import { Spinner } from "@/components/ui/spinner";
import { parseMotion } from "@/lib/motion";

export type ToastTypes =
  | "normal"
  | "action"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading"
  | "default";

export type PromiseT<Data = unknown> = Promise<Data> | (() => Promise<Data>);

export interface PromiseIExtendedResult extends ExternalToast {
  message: React.ReactNode;
}

export type PromiseTExtendedResult<Data = unknown> =
  | PromiseIExtendedResult
  | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);

export type PromiseTResult<Data = unknown> =
  | string
  | React.ReactNode
  | ((
      data: Data
    ) => React.ReactNode | string | Promise<React.ReactNode | string>);

export type PromiseExternalToast = Omit<ExternalToast, "description">;

export type PromiseData<ToastData = unknown> = PromiseExternalToast & {
  loading?: string | React.ReactNode;
  success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>;
  error?: PromiseTResult | PromiseTExtendedResult;
  description?: PromiseTResult;
  finally?: () => void | Promise<void>;
};

export interface ToastClassnames {
  actionButton?: string;
  cancelButton?: string;
  closeButton?: string;
  content?: string;
  default?: string;
  description?: string;
  error?: string;
  icon?: string;
  info?: string;
  loader?: string;
  loading?: string;
  success?: string;
  title?: string;
  toast?: string;
  warning?: string;
}

export interface ToastIcons {
  close?: React.ReactNode;
  error?: React.ReactNode;
  info?: React.ReactNode;
  loading?: React.ReactNode;
  success?: React.ReactNode;
  warning?: React.ReactNode;
}

export interface Action {
  actionButtonStyle?: React.CSSProperties;
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export interface ToastT {
  action?: Action | React.ReactNode;
  actionButtonStyle?: React.CSSProperties;
  cancel?: Action | React.ReactNode;
  cancelButtonStyle?: React.CSSProperties;
  className?: string;
  classNames?: ToastClassnames;
  closeButton?: boolean;
  delete?: boolean;
  description?: (() => React.ReactNode) | React.ReactNode;
  descriptionClassName?: string;
  dismissible?: boolean;
  duration?: number;
  icon?: React.ReactNode;
  id: number | string;
  invert?: boolean;
  jsx?: React.ReactNode;
  onAutoClose?: (toast: ToastT) => void;
  onDismiss?: (toast: ToastT) => void;
  position?: Position;
  promise?: PromiseT;
  richColors?: boolean;
  style?: React.CSSProperties;
  testId?: string;
  title?: (() => React.ReactNode) | React.ReactNode;
  toasterId?: string;
  type?: ToastTypes;
  unstyled?: boolean;
}

export function isAction(action: Action | React.ReactNode): action is Action {
  return (action as Action).label !== undefined;
}

export type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";
export interface HeightT {
  height: number;
  position: Position;
  toastId: number | string;
}

interface ToastOptions {
  actionButtonStyle?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  className?: string;
  classNames?: ToastClassnames;
  closeButton?: boolean;
  closeButtonAriaLabel?: string;
  descriptionClassName?: string;
  duration?: number;
  style?: React.CSSProperties;
  toasterId?: string;
  unstyled?: boolean;
}

type Offset =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;

export interface ToasterProps {
  className?: string;
  closeButton?: boolean;
  containerAriaLabel?: string;
  customAriaLabel?: string;
  dir?: "rtl" | "ltr" | "auto";
  duration?: number;
  expand?: boolean;
  gap?: number;
  hotkey?: string[];
  icons?: ToastIcons;
  id?: string;
  invert?: boolean;
  mobileOffset?: Offset;
  motion?: string;
  offset?: Offset;
  position?: Position;
  richColors?: boolean;
  style?: React.CSSProperties;
  swipeDirections?: SwipeDirection[];
  theme?: "light" | "dark" | "system";
  toastOptions?: ToastOptions;
  visibleToasts?: number;
}

export type SwipeDirection = "top" | "right" | "bottom" | "left";

export interface ToastProps {
  actionButtonStyle?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  className?: string;
  classNames?: ToastClassnames;
  closeButton: boolean;
  closeButtonAriaLabel?: string;
  defaultRichColors?: boolean;
  descriptionClassName?: string;
  duration?: number;
  expandByDefault: boolean;
  expanded: boolean;
  gap?: number;
  heights: HeightT[];
  icons?: ToastIcons;
  index: number;
  interacting: boolean;
  invert: boolean;
  loadingIcon?: React.ReactNode;
  position: Position;
  removeToast: (toast: ToastT) => void;
  setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
  style?: React.CSSProperties;
  swipeDirections?: SwipeDirection[];
  toast: ToastT;
  toasts: ToastT[];
  unstyled?: boolean;
  visibleToasts: number;
}

export const SwipeStateTypes = {
  NotSwiped: "NotSwiped",
  SwipedBack: "SwipedBack",
  SwipedOut: "SwipedOut",
} as const;
export type SwipeStateTypes =
  (typeof SwipeStateTypes)[keyof typeof SwipeStateTypes];

export type Theme = "light" | "dark";

export interface ToastToDismiss {
  dismiss: boolean;
  id: number | string;
}

export type ExternalToast = Omit<
  ToastT,
  "id" | "type" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number | string;
  toasterId?: string;
};

export const getAsset = (type: ToastTypes): React.ReactElement | null => {
  switch (type) {
    case "success":
      return SonnerSuccessIcon;

    case "info":
      return SonnerInfoIcon;

    case "warning":
      return SonnerWarningIcon;

    case "error":
      return SonnerErrorIcon;

    default:
      return null;
  }
};

const bars = new Array(12).fill(0);

const SonnerLoader = ({
  visible,
  className,
}: {
  visible: boolean;
  className?: string;
}) => (
  <div
    className={["sonner-loading-wrapper", className].filter(Boolean).join(" ")}
    data-visible={visible}
  >
    <div className="sonner-spinner">
      {bars.map((_, i) => (
        <div className="sonner-loading-bar" key={`spinner-bar-${i}`} />
      ))}
    </div>
  </div>
);

const SonnerSuccessIcon = (
  <svg
    aria-hidden="true"
    fill="currentColor"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      fillRule="evenodd"
    />
  </svg>
);

const SonnerWarningIcon = (
  <svg
    aria-hidden="true"
    fill="currentColor"
    height="20"
    viewBox="0 0 24 24"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
      fillRule="evenodd"
    />
  </svg>
);

const SonnerInfoIcon = (
  <svg
    aria-hidden="true"
    fill="currentColor"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      fillRule="evenodd"
    />
  </svg>
);

const SonnerErrorIcon = (
  <svg
    aria-hidden="true"
    fill="currentColor"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
      fillRule="evenodd"
    />
  </svg>
);

const SonnerCloseIcon = (
  <svg
    aria-hidden="true"
    fill="none"
    height="12"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

export const useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(
    document.hidden
  );

  React.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", callback);
    return () => document.removeEventListener("visibilitychange", callback);
  }, []);

  return isDocumentHidden;
};

let toastsCounter = 1;

const maxHistorySize = 100;

type titleT = (() => React.ReactNode) | React.ReactNode;

const getToastId = (data?: { id?: number | string }): string | number =>
  typeof data?.id === "number" ||
  (typeof data?.id === "string" && data.id.length > 0)
    ? (data?.id as string | number)
    : toastsCounter++;

class Observer {
  subscribers: Array<(toast: ToastT | ToastToDismiss) => void>;
  toasts: Array<ToastT | ToastToDismiss>;
  dismissedToasts: Set<string | number>;

  private readonly pendingDismissals: Map<string | number, number>;

  constructor() {
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = new Set();
    this.pendingDismissals = new Map();
  }

  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);

    this.getActiveToasts().forEach((toast) => subscriber(toast as ToastT));

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
    this.trimHistory();
  };

  private readonly trimHistory = () => {
    let toRemove = this.toasts.length - maxHistorySize;
    if (toRemove <= 0) {
      return;
    }

    this.toasts = this.toasts.filter((toast) => {
      if (toRemove > 0 && this.dismissedToasts.has(toast.id)) {
        this.dismissedToasts.delete(toast.id);
        toRemove--;
        return false;
      }

      return true;
    });
  };

  create = (
    data: ExternalToast & {
      message?: titleT;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: React.ReactElement;
    }
  ) => {
    const { message, ...rest } = data;
    const id = getToastId(data);

    const pendingDismissal = this.pendingDismissals.get(id);
    if (pendingDismissal !== undefined) {
      cancelAnimationFrame(pendingDismissal);
      this.pendingDismissals.delete(id);
      this.dismissedToasts.delete(id);
    }

    const wasDismissed = this.dismissedToasts.has(id);
    const dismissible =
      data.dismissible === undefined ? true : data.dismissible;

    if (wasDismissed) {
      this.dismissedToasts.delete(id);

      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    }

    const alreadyExists = wasDismissed
      ? undefined
      : this.toasts.find((toast) => toast.id === id);

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message });
          return {
            ...toast,
            ...data,
            dismissible,
            id,
            title: message,
          };
        }

        return toast;
      });
    } else {
      this.addToast({ title: message, ...rest, dismissible, id });
    }

    return id;
  };

  dismiss = (id?: number | string) => {
    if (id === undefined || id === null) {
      this.getActiveToasts().forEach((toast) => {
        this.dismissedToasts.add(toast.id);
        this.subscribers.forEach((subscriber) =>
          subscriber({ dismiss: true, id: toast.id })
        );
      });

      return id;
    }

    this.dismissedToasts.add(id);

    const alreadyPending = this.pendingDismissals.get(id);
    if (alreadyPending !== undefined) {
      cancelAnimationFrame(alreadyPending);
    }

    this.pendingDismissals.set(
      id,
      requestAnimationFrame(() => {
        this.pendingDismissals.delete(id);
        this.subscribers.forEach((subscriber) =>
          subscriber({ dismiss: true, id })
        );
      })
    );

    return id;
  };

  message = (message: titleT | React.ReactNode, data?: ExternalToast) =>
    this.create({ ...data, message, type: undefined });

  error = (message: titleT | React.ReactNode, data?: ExternalToast) =>
    this.create({ ...data, message, type: "error" });

  success = (message: titleT | React.ReactNode, data?: ExternalToast) =>
    this.create({ ...data, message, type: "success" });

  info = (message: titleT | React.ReactNode, data?: ExternalToast) =>
    this.create({ ...data, message, type: "info" });

  warning = (message: titleT | React.ReactNode, data?: ExternalToast) =>
    this.create({ ...data, message, type: "warning" });

  loading = (message: titleT | React.ReactNode, data?: ExternalToast) =>
    this.create({ ...data, message, type: "loading" });

  promise = <ToastData,>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>
  ) => {
    if (!data) {
      return;
    }

    let id: string | number | undefined;
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        description:
          typeof data.description === "function" ? undefined : data.description,
        message: data.loading,
        promise,
        type: "loading",
      });
    }

    const p = Promise.resolve(
      promise instanceof Function ? promise() : promise
    );

    let shouldDismiss = id !== undefined;
    let result: ["resolve", ToastData] | ["reject", unknown];

    const originalPromise = p
      .then(async (response) => {
        result = ["resolve", response];
        const isReactElementResponse = React.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({ id, message: response, type: "default" });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;

          const promiseData =
            typeof data.error === "function"
              ? await data.error(`HTTP error! status: ${response.status}`)
              : data.error;

          const description =
            typeof data.description === "function"
              ? await data.description(`HTTP error! status: ${response.status}`)
              : data.description;

          const isExtendedResult =
            typeof promiseData === "object" &&
            !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ description, id, type: "error", ...toastSettings });
        } else if (response instanceof Error) {
          shouldDismiss = false;

          const promiseData =
            typeof data.error === "function"
              ? await data.error(response)
              : data.error;

          const description =
            typeof data.description === "function"
              ? await data.description(response)
              : data.description;

          const isExtendedResult =
            typeof promiseData === "object" &&
            !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ description, id, type: "error", ...toastSettings });
        } else if (data.success !== undefined) {
          shouldDismiss = false;
          const promiseData =
            typeof data.success === "function"
              ? await data.success(response)
              : data.success;

          const description =
            typeof data.description === "function"
              ? await data.description(response)
              : data.description;

          const isExtendedResult =
            typeof promiseData === "object" &&
            !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ description, id, type: "success", ...toastSettings });
        }
      })
      .catch(async (error) => {
        result = ["reject", error];
        if (data.error !== undefined) {
          shouldDismiss = false;
          const promiseData =
            typeof data.error === "function"
              ? await data.error(error)
              : data.error;

          const description =
            typeof data.description === "function"
              ? await data.description(error)
              : data.description;

          const isExtendedResult =
            typeof promiseData === "object" &&
            !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ description, id, type: "error", ...toastSettings });
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          this.dismiss(id);
          id = undefined;
        }

        data.finally?.();
      });

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) =>
        originalPromise
          .then(() =>
            result[0] === "reject" ? reject(result[1]) : resolve(result[1])
          )
          .catch(reject)
      );

    if (typeof id !== "string" && typeof id !== "number") {
      return { unwrap };
    }
    return Object.assign(id, { unwrap });
  };

  custom = (
    jsx: (id: number | string) => React.ReactElement,
    data?: ExternalToast
  ) => {
    const id = getToastId(data);

    this.create({ ...data, id, jsx: jsx(id), type: undefined });
    return id;
  };

  getActiveToasts = () =>
    this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
}

export const ToastState = new Observer();

const toastFunction = (message: titleT, data?: ExternalToast) =>
  ToastState.message(message, data);

const isHttpResponse = (data: unknown): data is Response =>
  typeof data === "object" &&
  data !== null &&
  "ok" in data &&
  typeof data.ok === "boolean" &&
  "status" in data &&
  typeof data.status === "number";

const basicToast = toastFunction;

const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();

export const toast = Object.assign(
  basicToast,
  {
    custom: ToastState.custom,
    dismiss: ToastState.dismiss,
    error: ToastState.error,
    info: ToastState.info,
    loading: ToastState.loading,
    message: ToastState.message,
    promise: ToastState.promise,
    success: ToastState.success,
    warning: ToastState.warning,
  },
  { getHistory, getToasts }
);

const defaultVisibleToasts = 3;

const defaultViewportOffset = "24px";

const defaultMobileViewportOffset = "16px";

const defaultToastLifetime = 4000;

const defaultToastWidth = 356;

const defaultGap = 14;

const swipeThreshold = 45;

const timeBeforeUnmount = 200;

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getDefaultSwipeDirections(position: string): SwipeDirection[] {
  const [y, x] = position.split("-");
  const directions: SwipeDirection[] = [];

  if (y) {
    directions.push(y as SwipeDirection);
  }

  if (x) {
    directions.push(x as SwipeDirection);
  }

  return directions;
}

const Toast = (props: ToastProps) => {
  const {
    invert: ToasterInvert,
    toast,
    unstyled,
    interacting,
    setHeights,
    visibleToasts,
    heights,
    index,
    toasts,
    expanded,
    removeToast,
    defaultRichColors,
    closeButton: closeButtonFromToaster,
    style,
    cancelButtonStyle,
    actionButtonStyle,
    className = "",
    descriptionClassName = "",
    duration: durationFromToaster,
    position,
    gap,
    expandByDefault,
    classNames,
    icons,
    closeButtonAriaLabel = "Close toast",
  } = props;
  const [swipeDirection, setSwipeDirection] = React.useState<"x" | "y" | null>(
    null
  );
  const [swipeOutDirection, setSwipeOutDirection] = React.useState<
    "left" | "right" | "up" | "down" | null
  >(null);
  const [mounted, setMounted] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [swiping, setSwiping] = React.useState(false);
  const [swipeOut, setSwipeOut] = React.useState(false);
  const [isSwiped, setIsSwiped] = React.useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(0);
  const [initialHeight, setInitialHeight] = React.useState(0);
  const remainingTime = React.useRef(
    toast.duration || durationFromToaster || defaultToastLifetime
  );
  const dragStartTime = React.useRef<Date | null>(null);
  const toastRef = React.useRef<HTMLLIElement>(null);
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast.type;

  const toastTypeKey = toastType ?? "default";
  const dismissible = toast.dismissible !== false;
  const toastClassname = toast.className || "";
  const toastDescriptionClassname = toast.descriptionClassName || "";

  const heightIndex = React.useMemo(
    () => heights.findIndex((height) => height.toastId === toast.id) || 0,
    [heights, toast.id]
  );
  const closeButton = React.useMemo(
    () => toast.closeButton ?? closeButtonFromToaster,
    [toast.closeButton, closeButtonFromToaster]
  );
  const duration = React.useMemo(
    () => toast.duration || durationFromToaster || defaultToastLifetime,
    [toast.duration, durationFromToaster]
  );
  const closeTimerStartTimeRef = React.useRef(0);
  const offset = React.useRef(0);
  const lastCloseTimerStartTimeRef = React.useRef(0);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const [y, x] = position.split("-");
  const toastsHeightBefore = React.useMemo(
    () =>
      heights.reduce((prev, curr, reducerIndex) => {
        if (reducerIndex >= heightIndex) {
          return prev;
        }

        return prev + curr.height;
      }, 0),
    [heights, heightIndex]
  );
  const isDocumentHidden = useIsDocumentHidden();
  const swipeDirections = React.useMemo(
    () => props.swipeDirections ?? getDefaultSwipeDirections(position),
    [props.swipeDirections, position]
  );

  const invert = toast.invert || ToasterInvert;
  const disabled = toastType === "loading";

  offset.current = React.useMemo(
    () => heightIndex * (gap ?? defaultGap) + toastsHeightBefore,
    [heightIndex, toastsHeightBefore]
  );

  React.useEffect(() => {
    remainingTime.current = duration;
  }, [duration]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;

      setInitialHeight(height);
      setHeights((h) => [
        { height, position: toast.position ?? position, toastId: toast.id },
        ...h,
      ]);
      return () =>
        setHeights((h) => h.filter((height) => height.toastId !== toast.id));
    }
  }, [setHeights, toast.id]);

  React.useLayoutEffect(() => {
    if (!mounted) {
      return;
    }
    const toastNode = toastRef.current;
    if (!toastNode) {
      return;
    }
    const originalHeight = toastNode.style.height;
    toastNode.style.height = "auto";
    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;

    setInitialHeight(newHeight);

    setHeights((heights) => {
      const alreadyExists = heights.find(
        (height) => height.toastId === toast.id
      );
      if (alreadyExists) {
        return heights.map((height) =>
          height.toastId === toast.id
            ? { ...height, height: newHeight }
            : height
        );
      }
      return [
        {
          height: newHeight,
          position: toast.position ?? position,
          toastId: toast.id,
        },
        ...heights,
      ];
    });
  }, [
    mounted,
    toast.title,
    toast.description,
    setHeights,
    toast.id,
    toast.jsx,
    toast.action,
    toast.cancel,
  ]);

  const deleteToast = React.useCallback(() => {
    setRemoved(true);
    setOffsetBeforeRemove(offset.current);
    setHeights((h) => h.filter((height) => height.toastId !== toast.id));

    setTimeout(() => {
      removeToast(toast);
    }, timeBeforeUnmount);
  }, [toast, removeToast, setHeights, offset]);

  React.useEffect(() => {
    if (
      (toast.promise && toastType === "loading") ||
      toast.duration === Number.POSITIVE_INFINITY ||
      toast.type === "loading"
    ) {
      return;
    }
    let timeoutId: NodeJS.Timeout;

    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        const elapsedTime = Date.now() - closeTimerStartTimeRef.current;

        remainingTime.current -= elapsedTime;
      }

      lastCloseTimerStartTimeRef.current = Date.now();
    };

    const startTimer = () => {
      if (remainingTime.current === Number.POSITIVE_INFINITY) {
        return;
      }

      closeTimerStartTimeRef.current = Date.now();

      timeoutId = setTimeout(() => {
        toast.onAutoClose?.(toast);
        deleteToast();
      }, remainingTime.current);
    };

    if (expanded || interacting || isDocumentHidden) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => clearTimeout(timeoutId);
  }, [expanded, interacting, toast, toastType, isDocumentHidden, deleteToast]);

  React.useEffect(() => {
    if (toast.delete) {
      deleteToast();
      toast.onDismiss?.(toast);
    }
  }, [deleteToast, toast.delete]);

  function getLoadingIcon() {
    if (icons?.loading) {
      return (
        <div
          className={cn(
            classNames?.loader,
            toast?.classNames?.loader,
            "sonner-loader"
          )}
          data-visible={toastType === "loading"}
        >
          {icons.loading}
        </div>
      );
    }

    return (
      <SonnerLoader
        className={cn(classNames?.loader, toast?.classNames?.loader)}
        visible={toastType === "loading"}
      />
    );
  }

  const icon =
    toast.icon ||
    icons?.[
      toastType as "success" | "info" | "warning" | "error" | "loading"
    ] ||
    getAsset((toastType ?? "default") as ToastTypes);

  return (
    <li
      className={cn(
        className,
        toastClassname,
        classNames?.toast,
        toast?.classNames?.toast,
        classNames?.[toastTypeKey as keyof ToastClassnames],
        toast?.classNames?.[toastTypeKey as keyof ToastClassnames]
      )}
      data-dismissible={dismissible}
      data-expanded={Boolean(expanded || (expandByDefault && mounted))}
      data-front={isFront}
      data-index={index}
      data-invert={invert ?? false}
      data-mounted={mounted}
      data-promise={Boolean(toast.promise)}
      data-removed={removed}
      data-rich-colors={toast.richColors ?? defaultRichColors}
      data-sonner-toast=""
      data-styled={!(toast.jsx || toast.unstyled || unstyled)}
      data-swipe-direction={swipeOutDirection}
      data-swipe-out={swipeOut}
      data-swiped={isSwiped}
      data-swiping={swiping}
      data-testid={toast.testId}
      data-type={toastType}
      data-visible={isVisible}
      data-x-position={x}
      data-y-position={y}
      onDragEnd={() => {
        setSwiping(false);
        setSwipeDirection(null);
        pointerStartRef.current = null;
      }}
      onPointerDown={(event) => {
        if (event.button === 2) {
          return;
        }
        if (disabled || !dismissible) {
          return;
        }
        dragStartTime.current = new Date();
        setOffsetBeforeRemove(offset.current);

        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        if ((event.target as HTMLElement).tagName === "BUTTON") {
          return;
        }
        setSwiping(true);
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMove={(event) => {
        if (!(pointerStartRef.current && dismissible)) {
          return;
        }

        const isHighlighted =
          (window.getSelection()?.toString().length ?? 0) > 0;
        if (isHighlighted) {
          return;
        }

        const yDelta = event.clientY - pointerStartRef.current.y;
        const xDelta = event.clientX - pointerStartRef.current.x;

        if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
          setSwipeDirection(Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y");
        }

        const swipeAmount = { x: 0, y: 0 };

        const getDampening = (delta: number) => {
          const factor = Math.abs(delta) / 20;

          return 1 / (1.5 + factor);
        };

        if (swipeDirection === "y") {
          if (
            swipeDirections.includes("top") ||
            swipeDirections.includes("bottom")
          ) {
            if (
              (swipeDirections.includes("top") && yDelta < 0) ||
              (swipeDirections.includes("bottom") && yDelta > 0)
            ) {
              swipeAmount.y = yDelta;
            } else {
              const dampenedDelta = yDelta * getDampening(yDelta);

              swipeAmount.y =
                Math.abs(dampenedDelta) < Math.abs(yDelta)
                  ? dampenedDelta
                  : yDelta;
            }
          }
        } else if (
          swipeDirection === "x" &&
          (swipeDirections.includes("left") ||
            swipeDirections.includes("right"))
        ) {
          if (
            (swipeDirections.includes("left") && xDelta < 0) ||
            (swipeDirections.includes("right") && xDelta > 0)
          ) {
            swipeAmount.x = xDelta;
          } else {
            const dampenedDelta = xDelta * getDampening(xDelta);

            swipeAmount.x =
              Math.abs(dampenedDelta) < Math.abs(xDelta)
                ? dampenedDelta
                : xDelta;
          }
        }

        if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
          setIsSwiped(true);
        }

        toastRef.current?.style.setProperty(
          "--swipe-amount-x",
          `${swipeAmount.x}px`
        );
        toastRef.current?.style.setProperty(
          "--swipe-amount-y",
          `${swipeAmount.y}px`
        );
      }}
      onPointerUp={() => {
        if (swipeOut || !dismissible) {
          return;
        }

        pointerStartRef.current = null;
        const swipeAmountX = Number(
          toastRef.current?.style
            .getPropertyValue("--swipe-amount-x")
            .replace("px", "") || 0
        );
        const swipeAmountY = Number(
          toastRef.current?.style
            .getPropertyValue("--swipe-amount-y")
            .replace("px", "") || 0
        );
        const timeTaken = Date.now() - (dragStartTime.current?.getTime() ?? 0);

        const swipeAmount =
          swipeDirection === "x" ? swipeAmountX : swipeAmountY;
        const velocity = Math.abs(swipeAmount) / timeTaken;

        const isAllowedDirection =
          swipeDirection === "x"
            ? swipeDirections.includes(swipeAmountX > 0 ? "right" : "left")
            : swipeDirections.includes(swipeAmountY > 0 ? "bottom" : "top");

        if (
          isAllowedDirection &&
          (Math.abs(swipeAmount) >= swipeThreshold || velocity > 0.11)
        ) {
          setOffsetBeforeRemove(offset.current);

          toast.onDismiss?.(toast);

          if (swipeDirection === "x") {
            setSwipeOutDirection(swipeAmountX > 0 ? "right" : "left");
          } else {
            setSwipeOutDirection(swipeAmountY > 0 ? "down" : "up");
          }

          deleteToast();
          setSwipeOut(true);

          return;
        }
        toastRef.current?.style.setProperty("--swipe-amount-x", "0px");
        toastRef.current?.style.setProperty("--swipe-amount-y", "0px");
        setIsSwiped(false);
        setSwiping(false);
        setSwipeDirection(null);
      }}
      ref={toastRef}
      style={
        {
          "--index": index,
          "--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
          "--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
          "--toasts-before": index,
          "--z-index": toasts.length - index,
          ...style,
          ...toast.style,
        } as React.CSSProperties
      }
    >
      {closeButton && !toast.jsx && toastType !== "loading" ? (
        <button
          aria-label={closeButtonAriaLabel}
          className={cn(
            classNames?.closeButton,
            toast?.classNames?.closeButton
          )}
          data-close-button
          data-disabled={disabled}
          onClick={
            disabled || !dismissible
              ? () => {}
              : () => {
                  deleteToast();
                  toast.onDismiss?.(toast);
                }
          }
          type="button"
        >
          {icons?.close ?? SonnerCloseIcon}
        </button>
      ) : null}
      {}
      {(toastType || toast.icon || toast.promise) &&
      toast.icon !== null &&
      (icons?.[
        toastType as "success" | "info" | "warning" | "error" | "loading"
      ] !== null ||
        toast.icon) ? (
        <div
          className={cn(classNames?.icon, toast?.classNames?.icon)}
          data-icon=""
        >
          {}
          {toastType === "loading"
            ? toast.icon || getLoadingIcon()
            : toast.promise
              ? getLoadingIcon()
              : null}
          {toastType === "loading" ? null : icon}
        </div>
      ) : null}

      <div
        className={cn(classNames?.content, toast?.classNames?.content)}
        data-content=""
      >
        <div
          className={cn(classNames?.title, toast?.classNames?.title)}
          data-title=""
        >
          {toast.jsx
            ? toast.jsx
            : typeof toast.title === "function"
              ? toast.title()
              : toast.title}
        </div>
        {toast.description ? (
          <div
            className={cn(
              descriptionClassName,
              toastDescriptionClassname,
              classNames?.description,
              toast?.classNames?.description
            )}
            data-description=""
          >
            {typeof toast.description === "function"
              ? toast.description()
              : toast.description}
          </div>
        ) : null}
      </div>
      {React.isValidElement(toast.cancel) ? (
        toast.cancel
      ) : toast.cancel && isAction(toast.cancel) ? (
        <button
          className={cn(
            classNames?.cancelButton,
            toast?.classNames?.cancelButton
          )}
          data-button
          data-cancel
          onClick={(event) => {
            if (!isAction(toast.cancel)) {
              return;
            }
            if (!dismissible) {
              return;
            }
            toast.cancel.onClick?.(event);
            deleteToast();
          }}
          style={toast.cancelButtonStyle || cancelButtonStyle}
          type="button"
        >
          {toast.cancel.label}
        </button>
      ) : null}
      {React.isValidElement(toast.action) ? (
        toast.action
      ) : toast.action && isAction(toast.action) ? (
        <button
          className={cn(
            classNames?.actionButton,
            toast?.classNames?.actionButton
          )}
          data-action
          data-button
          onClick={(event) => {
            if (!isAction(toast.action)) {
              return;
            }
            toast.action.onClick?.(event);
            if (event.defaultPrevented) {
              return;
            }
            deleteToast();
          }}
          style={toast.actionButtonStyle || actionButtonStyle}
          type="button"
        >
          {toast.action.label}
        </button>
      ) : null}
    </li>
  );
};

function getDocumentDirection(): ToasterProps["dir"] {
  if (typeof window === "undefined") {
    return "ltr";
  }
  if (typeof document === "undefined") {
    return "ltr";
  }

  const dirAttribute = document.documentElement.getAttribute("dir");

  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement)
      .direction as ToasterProps["dir"];
  }

  return dirAttribute as ToasterProps["dir"];
}

function assignOffset(
  defaultOffset: ToasterProps["offset"],
  mobileOffset: ToasterProps["mobileOffset"]
) {
  const styles = {} as React.CSSProperties & Record<string, string | number>;

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile
      ? defaultMobileViewportOffset
      : defaultViewportOffset;

    function assignAll(offset: string | number) {
      ["top", "right", "bottom", "left"].forEach((key) => {
        styles[`${prefix}-${key}`] =
          typeof offset === "number" ? `${offset}px` : offset;
      });
    }

    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object") {
      ["top", "right", "bottom", "left"].forEach((key) => {
        if (
          (offset as Record<string, string | number | undefined>)[key] ===
          undefined
        ) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] =
            typeof (offset as Record<string, string | number | undefined>)[
              key
            ] === "number"
              ? `${(offset as Record<string, string | number | undefined>)[key]}px`
              : ((offset as Record<string, string | number | undefined>)[key] as
                  | string
                  | number);
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });

  return styles;
}

function useSonner() {
  const [activeToasts, setActiveToasts] = React.useState<ToastT[]>([]);

  React.useEffect(
    () =>
      ToastState.subscribe((toast) => {
        if ((toast as ToastToDismiss).dismiss) {
          setTimeout(() => {
            ReactDOM.flushSync(() => {
              setActiveToasts((toasts) =>
                toasts.filter((t) => t.id !== toast.id)
              );
            });
          });
          return;
        }

        setTimeout(() => {
          ReactDOM.flushSync(() => {
            setActiveToasts((toasts) => {
              const indexOfExistingToast = toasts.findIndex(
                (t) => t.id === toast.id
              );

              if (indexOfExistingToast !== -1) {
                return [
                  ...toasts.slice(0, indexOfExistingToast),
                  { ...toasts[indexOfExistingToast], ...toast },
                  ...toasts.slice(indexOfExistingToast + 1),
                ];
              }

              return [toast, ...toasts];
            });
          });
        });
      }),
    []
  );

  return {
    toasts: activeToasts,
  };
}

const ToasterEngine = React.forwardRef<HTMLElement, ToasterProps>(
  function Toaster(props, ref) {
    const {
      id,
      invert,
      position = "bottom-right",
      hotkey = ["altKey", "KeyT"],
      expand,
      closeButton,
      className,
      offset,
      mobileOffset,
      theme = "light",
      richColors,
      duration,
      style,
      visibleToasts = defaultVisibleToasts,
      toastOptions,
      dir = getDocumentDirection(),
      gap = defaultGap,
      icons,
      customAriaLabel,
      containerAriaLabel = "Notifications",
    } = props;
    const [toasts, setToasts] = React.useState<ToastT[]>([]);
    const filteredToasts = React.useMemo(() => {
      if (id) {
        return toasts.filter((toast) => toast.toasterId === id);
      }
      return toasts.filter((toast) => !toast.toasterId);
    }, [toasts, id]);
    const possiblePositions = React.useMemo(
      () =>
        Array.from(
          new Set(
            [position].concat(
              filteredToasts
                .filter((toast) => toast.position)
                .map((toast) => toast.position as Position)
            )
          )
        ),
      [filteredToasts, position]
    );
    const [heights, setHeights] = React.useState<HeightT[]>([]);
    const [expanded, setExpanded] = React.useState(false);
    const [interacting, setInteracting] = React.useState(false);
    const [actualTheme, setActualTheme] = React.useState(
      theme === "system"
        ? typeof window === "undefined"
          ? "light"
          : window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        : theme
    );

    const listRef = React.useRef<HTMLOListElement>(null);
    const hotkeyLabel = hotkey
      .join("+")
      .replace(/Key/g, "")
      .replace(/Digit/g, "");
    const lastFocusedElementRef = React.useRef<HTMLElement>(null);
    const isFocusWithinRef = React.useRef(false);

    const removeToast = React.useCallback((toastToRemove: ToastT) => {
      setToasts((toasts) => {
        if (!toasts.find((toast) => toast.id === toastToRemove.id)?.delete) {
          ToastState.dismiss(toastToRemove.id);
        }

        return toasts.filter(({ id }) => id !== toastToRemove.id);
      });
    }, []);

    React.useEffect(
      () =>
        ToastState.subscribe((toast) => {
          if ((toast as ToastToDismiss).dismiss) {
            requestAnimationFrame(() => {
              setToasts((toasts) =>
                toasts.map((t) =>
                  t.id === toast.id ? { ...t, delete: true } : t
                )
              );
            });
            return;
          }

          setTimeout(() => {
            ReactDOM.flushSync(() => {
              setToasts((toasts) => {
                const indexOfExistingToast = toasts.findIndex(
                  (t) => t.id === toast.id
                );

                if (indexOfExistingToast !== -1) {
                  return [
                    ...toasts.slice(0, indexOfExistingToast),
                    { ...toasts[indexOfExistingToast], ...toast },
                    ...toasts.slice(indexOfExistingToast + 1),
                  ];
                }

                return [toast, ...toasts];
              });
            });
          });
        }),
      []
    );

    React.useEffect(() => {
      if (theme !== "system") {
        setActualTheme(theme);
        return;
      }

      if (theme === "system") {
        if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
          setActualTheme("dark");
        } else {
          setActualTheme("light");
        }
      }

      if (typeof window === "undefined") {
        return;
      }
      const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      try {
        darkMediaQuery.addEventListener("change", ({ matches }) => {
          if (matches) {
            setActualTheme("dark");
          } else {
            setActualTheme("light");
          }
        });
      } catch {
        darkMediaQuery.addListener(({ matches }) => {
          try {
            if (matches) {
              setActualTheme("dark");
            } else {
              setActualTheme("light");
            }
          } catch (e) {
            console.error(e);
          }
        });
      }
    }, [theme]);

    React.useEffect(() => {
      if (toasts.length <= 1) {
        setExpanded(false);
      }
    }, [toasts]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const isHotkeyPressed =
          hotkey.length > 0 &&
          hotkey.every(
            (key) =>
              (event as unknown as Record<string, unknown>)[key] ||
              event.code === key
          );

        if (isHotkeyPressed) {
          setExpanded(true);
          listRef.current?.focus();
        }

        if (
          event.code === "Escape" &&
          (document.activeElement === listRef.current ||
            listRef.current?.contains(document.activeElement))
        ) {
          setExpanded(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);

      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [hotkey]);

    React.useEffect(() => {
      if (listRef.current) {
        return () => {
          if (lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus({ preventScroll: true });
            lastFocusedElementRef.current = null;
            isFocusWithinRef.current = false;
          }
        };
      }
    }, [listRef.current]);

    return (
      <section
        aria-atomic="false"
        aria-label={customAriaLabel ?? `${containerAriaLabel} ${hotkeyLabel}`}
        aria-live="polite"
        aria-relevant="additions text"
        data-react-aria-top-layer
        ref={ref}
        suppressHydrationWarning
        tabIndex={-1}
      >
        {possiblePositions.map((position, index) => {
          const [y, x] = position.split("-");

          if (!filteredToasts.length) {
            return null;
          }

          return (
            <ol
              className={className}
              data-sonner-theme={actualTheme}
              data-sonner-toaster
              data-x-position={x}
              data-y-position={y}
              dir={dir === "auto" ? getDocumentDirection() : dir}
              key={position}
              onBlur={(event) => {
                if (
                  isFocusWithinRef.current &&
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  isFocusWithinRef.current = false;
                  if (lastFocusedElementRef.current) {
                    lastFocusedElementRef.current.focus({
                      preventScroll: true,
                    });
                    lastFocusedElementRef.current = null;
                  }
                }
              }}
              onDragEnd={() => setExpanded(false)}
              onFocus={(event) => {
                const isNotDismissible =
                  event.target instanceof HTMLElement &&
                  event.target.dataset.dismissible === "false";

                if (isNotDismissible) {
                  return;
                }

                if (!isFocusWithinRef.current) {
                  isFocusWithinRef.current = true;
                  lastFocusedElementRef.current =
                    event.relatedTarget as HTMLElement;
                }
              }}
              onMouseEnter={() => setExpanded(true)}
              onMouseLeave={() => {
                if (!interacting) {
                  setExpanded(false);
                }
              }}
              onMouseMove={() => setExpanded(true)}
              onPointerDown={(event) => {
                const isNotDismissible =
                  event.target instanceof HTMLElement &&
                  event.target.dataset.dismissible === "false";

                if (isNotDismissible) {
                  return;
                }
                setInteracting(true);
              }}
              onPointerUp={() => setInteracting(false)}
              ref={listRef}
              style={
                {
                  "--front-toast-height": `${heights[0]?.height || 0}px`,
                  "--gap": `${gap}px`,
                  "--width": `${defaultToastWidth}px`,
                  ...style,
                  ...assignOffset(offset, mobileOffset),
                } as React.CSSProperties
              }
              tabIndex={-1}
            >
              {filteredToasts
                .filter(
                  (toast) =>
                    (!toast.position && index === 0) ||
                    toast.position === position
                )
                .map((toast, index) => (
                  <Toast
                    actionButtonStyle={toastOptions?.actionButtonStyle}
                    cancelButtonStyle={toastOptions?.cancelButtonStyle}
                    className={toastOptions?.className}
                    classNames={toastOptions?.classNames}
                    closeButton={
                      toastOptions?.closeButton ?? closeButton ?? false
                    }
                    closeButtonAriaLabel={toastOptions?.closeButtonAriaLabel}
                    defaultRichColors={richColors}
                    descriptionClassName={toastOptions?.descriptionClassName}
                    duration={toastOptions?.duration ?? duration}
                    expandByDefault={expand ?? false}
                    expanded={expanded}
                    gap={gap}
                    heights={heights.filter(
                      (h) => h.position === (toast.position ?? position)
                    )}
                    icons={icons}
                    index={index}
                    interacting={interacting}
                    invert={invert ?? false}
                    key={toast.id}
                    position={position}
                    removeToast={removeToast}
                    setHeights={setHeights}
                    style={toastOptions?.style}
                    swipeDirections={props.swipeDirections}
                    toast={toast}
                    toasts={filteredToasts.filter(
                      (t) => t.position === (toast.position ?? position)
                    )}
                    unstyled={toastOptions?.unstyled}
                    visibleToasts={visibleToasts}
                  />
                ))}
            </ol>
          );
        })}
      </section>
    );
  }
);

const sonnerStyles = `html[dir='ltr'],
[data-sonner-toaster][dir='ltr'] {
  --toast-icon-margin-start: -3px;
  --toast-icon-margin-end: 4px;
  --toast-svg-margin-start: -1px;
  --toast-svg-margin-end: 0px;
  --toast-button-margin-start: auto;
  --toast-button-margin-end: 0;
  --toast-close-button-start: 0;
  --toast-close-button-end: unset;
  --toast-close-button-transform: translate(-35%, -35%);
}

html[dir='rtl'],
[data-sonner-toaster][dir='rtl'] {
  --toast-icon-margin-start: 4px;
  --toast-icon-margin-end: -3px;
  --toast-svg-margin-start: 0px;
  --toast-svg-margin-end: -1px;
  --toast-button-margin-start: 0;
  --toast-button-margin-end: auto;
  --toast-close-button-start: unset;
  --toast-close-button-end: 0;
  --toast-close-button-transform: translate(35%, -35%);
}

[data-sonner-toaster] {
  position: fixed;
  width: var(--width);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
    Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  --gray1: hsl(0, 0%, 99%);
  --gray2: hsl(0, 0%, 97.3%);
  --gray3: hsl(0, 0%, 95.1%);
  --gray4: hsl(0, 0%, 93%);
  --gray5: hsl(0, 0%, 90.9%);
  --gray6: hsl(0, 0%, 88.7%);
  --gray7: hsl(0, 0%, 85.8%);
  --gray8: hsl(0, 0%, 78%);
  --gray9: hsl(0, 0%, 56.1%);
  --gray10: hsl(0, 0%, 52.3%);
  --gray11: hsl(0, 0%, 43.5%);
  --gray12: hsl(0, 0%, 9%);
  --border-radius: 8px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  list-style: none;
  outline: none;
  z-index: 999999999;
  transition: transform 400ms ease;
}

@media (hover: none) and (pointer: coarse) {
  [data-sonner-toaster][data-lifted='true'] {
    transform: none;
  }
}

[data-sonner-toaster][data-x-position='right'] {
  right: var(--offset-right);
}

[data-sonner-toaster][data-x-position='left'] {
  left: var(--offset-left);
}

[data-sonner-toaster][data-x-position='center'] {
  left: 50%;
  transform: translateX(-50%);
}

[data-sonner-toaster][data-y-position='top'] {
  top: var(--offset-top);
}

[data-sonner-toaster][data-y-position='bottom'] {
  bottom: var(--offset-bottom);
}

[data-sonner-toast] {
  --y: translateY(100%);
  --lift-amount: calc(var(--lift) * var(--gap));
  z-index: var(--z-index);
  position: absolute;
  opacity: 0;
  transform: var(--y);
  touch-action: none;
  transition: transform var(--sonner-motion-duration, 400ms) var(--sonner-motion-easing, ease), opacity var(--sonner-motion-duration, 400ms) var(--sonner-motion-easing, ease), height var(--sonner-motion-duration, 400ms) var(--sonner-motion-easing, ease), box-shadow 200ms;
  box-sizing: border-box;
  outline: none;
  overflow-wrap: anywhere;
}

[data-sonner-toast][data-styled='true'] {
  padding: 16px;
  background: var(--normal-bg);
  border: 1px solid var(--normal-border);
  color: var(--normal-text);
  border-radius: var(--border-radius);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  width: var(--width);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

[data-sonner-toast]:focus-visible {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2);
}

[data-sonner-toast][data-y-position='top'] {
  top: 0;
  --y: translateY(-100%);
  --lift: 1;
  --lift-amount: calc(1 * var(--gap));
}

[data-sonner-toast][data-y-position='bottom'] {
  bottom: 0;
  --y: translateY(100%);
  --lift: -1;
  --lift-amount: calc(var(--lift) * var(--gap));
}

[data-sonner-toast][data-styled='true'] [data-description] {
  font-weight: 400;
  line-height: 1.4;
  color: #3f3f3f;
}

[data-rich-colors='true'][data-sonner-toast][data-styled='true'] [data-description] {
  color: inherit;
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-description] {
  color: hsl(0, 0%, 91%);
}

[data-sonner-toast][data-styled='true'] [data-title] {
  font-weight: 500;
  line-height: 1.5;
  color: inherit;
}

[data-sonner-toast][data-styled='true'] [data-icon] {
  display: flex;
  height: 16px;
  width: 16px;
  position: relative;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;
  margin-left: var(--toast-icon-margin-start);
  margin-right: var(--toast-icon-margin-end);
}

[data-sonner-toast][data-promise='true'] [data-icon] > svg {
  opacity: 0;
  transform: scale(0.8);
  transform-origin: center;
  animation: sonner-fade-in 300ms ease forwards;
}

[data-sonner-toast][data-styled='true'] [data-icon] > * {
  flex-shrink: 0;
}

[data-sonner-toast][data-styled='true'] [data-icon] svg {
  margin-left: var(--toast-svg-margin-start);
  margin-right: var(--toast-svg-margin-end);
}

[data-sonner-toast][data-styled='true'] [data-content] {
  display: flex;
  flex-direction: column;
  gap: 2px;

  flex: 1;
  min-width: 0;
}

[data-sonner-toast][data-styled='true'] [data-button] {
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
  height: 24px;
  font-size: 12px;
  color: var(--normal-bg);
  background: var(--normal-text);
  margin-left: var(--toast-button-margin-start);
  margin-right: var(--toast-button-margin-end);
  border: none;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity 400ms, box-shadow 200ms;
}

[data-sonner-toast][data-styled='true'] [data-button]:focus-visible {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
}

[data-sonner-toast][data-styled='true'] [data-button]:first-of-type {
  margin-left: var(--toast-button-margin-start);
  margin-right: var(--toast-button-margin-end);
}

[data-sonner-toast][data-styled='true'] [data-cancel] {
  color: var(--normal-text);
  background: rgba(0, 0, 0, 0.08);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast][data-styled='true'] [data-cancel] {
  background: rgba(255, 255, 255, 0.3);
}

[data-sonner-toast][data-styled='true'] [data-close-button] {
  position: absolute;
  left: var(--toast-close-button-start);
  right: var(--toast-close-button-end);
  top: 0;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  color: var(--normal-text);
  background: var(--normal-bg);
  border: 1px solid var(--normal-border);
  transform: var(--toast-close-button-transform);
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  transition: opacity 100ms, background 200ms, border-color 200ms;
}

[data-sonner-toast][data-styled='true'] [data-close-button]:focus-visible {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2);
}

[data-sonner-toast][data-styled='true'] [data-disabled='true'] {
  cursor: not-allowed;
}

[data-sonner-toast][data-styled='true']:hover [data-close-button]:hover {
  background: var(--gray2);
  border-color: var(--gray5);
}

[data-sonner-toast][data-swiping='true']::before {
  content: '';
  position: absolute;
  left: -100%;
  right: -100%;
  height: 100%;
  z-index: -1;
}

[data-sonner-toast][data-y-position='top'][data-swiping='true']::before {
  bottom: 50%;
  transform: scaleY(3) translateY(50%);
}

[data-sonner-toast][data-y-position='bottom'][data-swiping='true']::before {
  top: 50%;
  transform: scaleY(3) translateY(-50%);
}

[data-sonner-toast][data-swiping='false'][data-removed='true']::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: scaleY(2);
}

[data-sonner-toast][data-expanded='true']::after {
  content: '';
  position: absolute;
  left: 0;
  height: calc(var(--gap) + 1px);
  bottom: 100%;
  width: 100%;
}

[data-sonner-toast][data-mounted='true'] {
  --y: translateY(0);
  opacity: 1;
}

[data-sonner-toast][data-expanded='false'][data-front='false'] {
  --scale: var(--toasts-before) * 0.05 + 1;
  --y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));
  height: var(--front-toast-height);
}

[data-sonner-toast] > * {
  transition: opacity var(--sonner-motion-duration, 400ms) var(--sonner-motion-easing, ease);
}

[data-sonner-toast][data-x-position='right'] {
  right: 0;
}

[data-sonner-toast][data-x-position='left'] {
  left: 0;
}

[data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true'] > * {
  opacity: 0;
}

[data-sonner-toast][data-visible='false'] {
  opacity: 0;
  pointer-events: none;
}

[data-sonner-toast][data-mounted='true'][data-expanded='true'] {
  --y: translateY(calc(var(--lift) * var(--offset)));
  height: var(--initial-height);
}

[data-sonner-toast][data-removed='true'][data-front='true'][data-swipe-out='false'] {
  --y: translateY(calc(var(--lift) * -100%));
  opacity: 0;
}

[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='true'] {
  --y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));
  opacity: 0;
}

[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='false'] {
  --y: translateY(40%);
  opacity: 0;
  transition: transform 500ms, opacity 200ms;
}

[data-sonner-toast][data-removed='true'][data-front='false']::before {
  height: calc(var(--initial-height) + 20%);
}

[data-sonner-toast][data-swiping='true'] {
  transform: var(--y) translateY(var(--swipe-amount-y, 0px)) translateX(var(--swipe-amount-x, 0px));
  transition: none;
}

[data-sonner-toast][data-swiped='true'] {
  -webkit-user-select: none;
  user-select: none;
}

[data-sonner-toast][data-swipe-out='true'][data-y-position='bottom'],
[data-sonner-toast][data-swipe-out='true'][data-y-position='top'] {
  animation-duration: var(--sonner-motion-duration, 200ms);
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='left'] {
  animation-name: swipe-out-left;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='right'] {
  animation-name: swipe-out-right;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='up'] {
  animation-name: swipe-out-up;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='down'] {
  animation-name: swipe-out-down;
}

@keyframes swipe-out-left {
  from {
    transform: var(--y) translateX(var(--swipe-amount-x));
    opacity: 1;
  }

  to {
    transform: var(--y) translateX(calc(var(--swipe-amount-x) - 100%));
    opacity: 0;
  }
}

@keyframes swipe-out-right {
  from {
    transform: var(--y) translateX(var(--swipe-amount-x));
    opacity: 1;
  }

  to {
    transform: var(--y) translateX(calc(var(--swipe-amount-x) + 100%));
    opacity: 0;
  }
}

@keyframes swipe-out-up {
  from {
    transform: var(--y) translateY(var(--swipe-amount-y));
    opacity: 1;
  }

  to {
    transform: var(--y) translateY(calc(var(--swipe-amount-y) - 100%));
    opacity: 0;
  }
}

@keyframes swipe-out-down {
  from {
    transform: var(--y) translateY(var(--swipe-amount-y));
    opacity: 1;
  }

  to {
    transform: var(--y) translateY(calc(var(--swipe-amount-y) + 100%));
    opacity: 0;
  }
}

@media (max-width: 600px) {
  [data-sonner-toaster] {
    position: fixed;
    right: var(--mobile-offset-right);
    left: var(--mobile-offset-left);
    width: 100%;
  }

  [data-sonner-toaster][dir='rtl'] {
    left: calc(var(--mobile-offset-left) * -1);
  }

  [data-sonner-toaster] [data-sonner-toast] {
    left: 0;
    right: 0;
    width: calc(100% - var(--mobile-offset-left) * 2);
  }

  [data-sonner-toaster][data-x-position='left'] {
    left: var(--mobile-offset-left);
  }

  [data-sonner-toaster][data-y-position='bottom'] {
    bottom: var(--mobile-offset-bottom);
  }

  [data-sonner-toaster][data-y-position='top'] {
    top: var(--mobile-offset-top);
  }

  [data-sonner-toaster][data-x-position='center'] {
    left: var(--mobile-offset-left);
    right: var(--mobile-offset-right);
    transform: none;
  }
}

[data-sonner-toaster][data-sonner-theme='light'] {
  --normal-bg: #fff;
  --normal-border: var(--gray4);
  --normal-text: var(--gray12);

  --success-bg: hsl(143, 85%, 96%);
  --success-border: hsl(145, 92%, 87%);
  --success-text: hsl(140, 100%, 27%);

  --info-bg: hsl(208, 100%, 97%);
  --info-border: hsl(221, 91%, 93%);
  --info-text: hsl(210, 92%, 45%);

  --warning-bg: hsl(49, 100%, 97%);
  --warning-border: hsl(49, 91%, 84%);
  --warning-text: hsl(31, 92%, 45%);

  --error-bg: hsl(359, 100%, 97%);
  --error-border: hsl(359, 100%, 94%);
  --error-text: hsl(360, 100%, 45%);
}

[data-sonner-toaster][data-sonner-theme='light'] [data-sonner-toast][data-invert='true'] {
  --normal-bg: #000;
  --normal-border: hsl(0, 0%, 20%);
  --normal-text: var(--gray1);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast][data-invert='true'] {
  --normal-bg: #fff;
  --normal-border: var(--gray3);
  --normal-text: var(--gray12);
}

[data-sonner-toaster][data-sonner-theme='dark'] {
  --normal-bg: #000;
  --normal-bg-hover: hsl(0, 0%, 12%);
  --normal-border: hsl(0, 0%, 20%);
  --normal-border-hover: hsl(0, 0%, 25%);
  --normal-text: var(--gray1);

  --success-bg: hsl(150, 100%, 6%);
  --success-border: hsl(147, 100%, 12%);
  --success-text: hsl(150, 86%, 65%);

  --info-bg: hsl(215, 100%, 6%);
  --info-border: hsl(223, 43%, 17%);
  --info-text: hsl(216, 87%, 65%);

  --warning-bg: hsl(64, 100%, 6%);
  --warning-border: hsl(60, 100%, 9%);
  --warning-text: hsl(46, 87%, 65%);

  --error-bg: hsl(358, 76%, 10%);
  --error-border: hsl(357, 89%, 16%);
  --error-text: hsl(358, 100%, 81%);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast] [data-close-button] {
  background: var(--normal-bg);
  border-color: var(--normal-border);
  color: var(--normal-text);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast] [data-close-button]:hover {
  background: var(--normal-bg-hover);
  border-color: var(--normal-border-hover);
}

[data-rich-colors='true'][data-sonner-toast][data-type='success'] {
  background: var(--success-bg);
  border-color: var(--success-border);
  color: var(--success-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='success'] [data-close-button] {
  background: var(--success-bg);
  border-color: var(--success-border);
  color: var(--success-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='info'] {
  background: var(--info-bg);
  border-color: var(--info-border);
  color: var(--info-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='info'] [data-close-button] {
  background: var(--info-bg);
  border-color: var(--info-border);
  color: var(--info-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='warning'] {
  background: var(--warning-bg);
  border-color: var(--warning-border);
  color: var(--warning-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='warning'] [data-close-button] {
  background: var(--warning-bg);
  border-color: var(--warning-border);
  color: var(--warning-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='error'] {
  background: var(--error-bg);
  border-color: var(--error-border);
  color: var(--error-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='error'] [data-close-button] {
  background: var(--error-bg);
  border-color: var(--error-border);
  color: var(--error-text);
}

.sonner-loading-wrapper {
  --size: 16px;
  height: var(--size);
  width: var(--size);
  position: absolute;
  inset: 0;
  z-index: 10;
}

.sonner-loading-wrapper[data-visible='false'] {
  transform-origin: center;
  animation: sonner-fade-out 0.2s ease forwards;
}

.sonner-spinner {
  position: relative;
  top: 50%;
  left: 50%;
  height: var(--size);
  width: var(--size);
}

.sonner-loading-bar {
  animation: sonner-spin 1.2s linear infinite;
  background: var(--gray11);
  border-radius: 6px;
  height: 8%;
  left: -10%;
  position: absolute;
  top: -3.9%;
  width: 24%;
}

.sonner-loading-bar:nth-child(1) {
  animation-delay: -1.2s;
  transform: rotate(0.0001deg) translate(146%);
}

.sonner-loading-bar:nth-child(2) {
  animation-delay: -1.1s;
  transform: rotate(30deg) translate(146%);
}

.sonner-loading-bar:nth-child(3) {
  animation-delay: -1s;
  transform: rotate(60deg) translate(146%);
}

.sonner-loading-bar:nth-child(4) {
  animation-delay: -0.9s;
  transform: rotate(90deg) translate(146%);
}

.sonner-loading-bar:nth-child(5) {
  animation-delay: -0.8s;
  transform: rotate(120deg) translate(146%);
}

.sonner-loading-bar:nth-child(6) {
  animation-delay: -0.7s;
  transform: rotate(150deg) translate(146%);
}

.sonner-loading-bar:nth-child(7) {
  animation-delay: -0.6s;
  transform: rotate(180deg) translate(146%);
}

.sonner-loading-bar:nth-child(8) {
  animation-delay: -0.5s;
  transform: rotate(210deg) translate(146%);
}

.sonner-loading-bar:nth-child(9) {
  animation-delay: -0.4s;
  transform: rotate(240deg) translate(146%);
}

.sonner-loading-bar:nth-child(10) {
  animation-delay: -0.3s;
  transform: rotate(270deg) translate(146%);
}

.sonner-loading-bar:nth-child(11) {
  animation-delay: -0.2s;
  transform: rotate(300deg) translate(146%);
}

.sonner-loading-bar:nth-child(12) {
  animation-delay: -0.1s;
  transform: rotate(330deg) translate(146%);
}

@keyframes sonner-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sonner-fade-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes sonner-spin {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.15;
  }
}

@media (prefers-reduced-motion) {
  [data-sonner-toast],
  [data-sonner-toast] > *,
  .sonner-loading-bar {
    transition: none !important;
    animation: none !important;
  }
}

.sonner-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center;
  transition: opacity 200ms, transform 200ms;
}

.sonner-loader[data-visible='false'] {
  opacity: 0;
  transform: scale(0.8) translate(-50%, -50%);
}

[data-sonner-toast][data-dismissible='true'] {
  cursor: grab;
}

[data-sonner-toast][data-dismissible='true'][data-swiping='true'] {
  cursor: grabbing;
}

[data-sonner-toast][data-dismissible='true'][data-removed='true'] {
  cursor: default;
}
`;

const useSonnerStyles = () => {
  React.useEffect(() => {
    const id = "sonner-styles";
    if (document.getElementById(id)) {
      return;
    }
    const style = document.createElement("style");
    style.id = id;
    style.textContent = sonnerStyles;
    document.head.appendChild(style);
  }, []);
};

const Toaster = ({
  position,
  motion,
  style: styleProp,
  ...props
}: ToasterProps) => {
  useSonnerStyles();
  const { theme = "system" } = useTheme();
  const parsed = React.useMemo(() => parseMotion(motion), [motion]);
  const motionStyle = React.useMemo(() => {
    if (!parsed) {
      return {};
    }
    return {
      "--sonner-motion-duration": `${parsed.duration}ms`,
      "--sonner-motion-easing": parsed.easing,
    } as React.CSSProperties;
  }, [parsed]);
  const [responsive, setResponsive] = React.useState<ToasterProps["position"]>(
    position ?? "top-center"
  );
  React.useEffect(() => {
    if (position) {
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      setResponsive(mq.matches ? "bottom-right" : "top-center");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [position]);

  return (
    <ToasterEngine
      className="toaster group"
      icons={{
        error: (
          <div className="bg-destructive/10 text-destructive flex size-7 items-center justify-center rounded-lg">
            <OctagonXIcon className="size-4" />
          </div>
        ),
        info: (
          <div className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-lg">
            <InfoIcon className="size-4" />
          </div>
        ),
        loading: (
          <div className="bg-muted flex size-7 items-center justify-center rounded-lg">
            <Spinner />
          </div>
        ),
        success: (
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CircleCheckIcon className="size-4" />
          </div>
        ),
        warning: (
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TriangleAlertIcon className="size-4" />
          </div>
        ),
      }}
      position={position ?? responsive}
      style={
        {
          "--border-radius": "var(--radius)",
          "--normal-bg": "var(--surface)",
          "--normal-border": "transparent",
          "--normal-text": "var(--surface-foreground)",
          ...styleProp,
          ...motionStyle,
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          actionButton:
            "!bg-foreground !text-background !h-7 !px-3 !text-xs !rounded-md !font-medium hover:!bg-foreground/90 !transition-colors",
          cancelButton:
            "!bg-muted !text-foreground !h-7 !px-3 !text-xs !rounded-md",
          closeButton:
            "!bg-transparent !border-0 !text-muted-foreground/60 hover:!text-foreground !-right-1 !-top-1",
          content: "!flex-1 !min-w-0 !gap-0.5",
          description: "!text-xs !text-muted-foreground !leading-snug !mt-0.5",
          title: "!text-[13px] !font-medium !leading-tight !tracking-tight",
          toast:
            "cn-toast !flex !items-center !gap-3 !w-[360px] !p-3.5 !rounded-xl !bg-surface !text-surface-foreground !border-0 !shadow-[0_10px_40px_-10px_rgba(0,0,0,0.18)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, useSonner };
