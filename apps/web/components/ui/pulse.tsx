"use client";

import { CircleCheck, TriangleAlertIcon, X } from "lucide-react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trace, TraceIcon, TraceLine } from "@/components/ui/trace";
import { cn } from "@/lib/utils";

const MAGNIFY = 5;
const SPREAD = 2.4;
const EASE = 18;
const DAY = 86_400_000;

export type DayStatus = "up" | "degraded" | "down" | "none";

export interface IncidentUpdate {
  label: string;
  note?: string;
  time: string;
}

export interface Incident {
  minutes: number;
  status: "degraded" | "down";
  title: string;
  updates: IncidentUpdate[];
}

export interface PulseService {
  incidents?: Record<number, Incident>;
  missing?: number;
  name: string;
}

export interface PulseProps {
  className?: string;
  days?: number;
  endDate?: string;
  services?: PulseService[];
  title?: string;
}

const DEFAULT_SERVICES: PulseService[] = [
  {
    incidents: {
      19: {
        minutes: 18,
        status: "degraded",
        title: "Elevated error rates on install",
        updates: [
          {
            label: "Investigating",
            note: "5xx on POST /r/* rose to 2%.",
            time: "14:02",
          },
          {
            label: "Identified",
            note: "A bad cache invalidation push.",
            time: "14:11",
          },
          {
            label: "Resolved",
            note: "Rolled back; error rates normal.",
            time: "14:20",
          },
        ],
      },
      84: {
        minutes: 23,
        status: "degraded",
        title: "Slow responses in eu-west",
        updates: [
          {
            label: "Investigating",
            note: "p95 latency up 3x in eu-west.",
            time: "09:41",
          },
          {
            label: "Monitoring",
            note: "Added capacity to the pool.",
            time: "09:52",
          },
          { label: "Resolved", time: "10:04" },
        ],
      },
    },
    name: "Registry",
  },
  {
    incidents: {
      43: {
        minutes: 12,
        status: "degraded",
        title: "Search results failing to load",
        updates: [
          { label: "Investigating", time: "18:30" },
          {
            label: "Resolved",
            note: "A CDN cache rule was reverted.",
            time: "18:42",
          },
        ],
      },
    },
    name: "Docs",
  },
  {
    incidents: {
      69: {
        minutes: 48,
        status: "down",
        title: "Downloads delayed",
        updates: [
          {
            label: "Investigating",
            note: "The npm mirror stopped syncing.",
            time: "02:15",
          },
          {
            label: "Identified",
            note: "A worker deploy failed health checks.",
            time: "02:38",
          },
          {
            label: "Resolved",
            note: "Backlog synced in order.",
            time: "03:03",
          },
        ],
      },
    },
    name: "CLI",
  },
  {
    incidents: {
      27: {
        minutes: 9,
        status: "down",
        title: "Preview builds stalled",
        updates: [
          {
            label: "Investigating",
            note: "Build workers stopped accepting jobs.",
            time: "22:07",
          },
          {
            label: "Resolved",
            note: "Promoted a backup worker pool.",
            time: "22:16",
          },
        ],
      },
    },
    missing: 6,
    name: "Preview",
  },
];

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const formatDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
  });

function statusOf(service: PulseService, day: number): DayStatus {
  if (day < (service.missing ?? 0)) {
    return "none";
  }
  return service.incidents?.[day]?.status ?? "up";
}

function uptimeOf(service: PulseService, days: number) {
  const tracked = days - (service.missing ?? 0);
  let lost = 0;
  for (const incident of Object.values(service.incidents ?? {})) {
    lost += incident.minutes * (incident.status === "down" ? 1 : 0.5);
  }
  return 100 * (1 - lost / (tracked * 1440));
}

function swell(count: number, focus: number | null, out: Float64Array) {
  for (let i = 0; i < count; i++) {
    out[i] =
      focus === null
        ? 1
        : 1 + MAGNIFY * Math.exp(-(((i - focus) / SPREAD) ** 2));
  }
  return out;
}

function barAt(weights: Float64Array, x: number) {
  let total = 0;
  for (const w of weights) {
    total += w;
  }
  let at = x * total;
  for (let i = 0; i < weights.length; i++) {
    at -= weights[i];
    if (at <= 0) {
      return i;
    }
  }
  return weights.length - 1;
}

function incidentsOn(services: PulseService[], day: number) {
  return services.flatMap((s) => {
    const incident = s.incidents?.[day];
    return incident ? [{ incident, service: s.name }] : [];
  });
}

function describeDay(list: { service: string; incident: Incident }[]) {
  const first = list[0];
  if (!first) {
    return "No incidents";
  }
  const how = first.incident.status === "down" ? "down" : "degraded";
  const more = list.length > 1 ? `, +${list.length - 1} more` : "";
  return `${first.service} ${how} for ${first.incident.minutes} min${more}`;
}

const BAR_COLOR: Record<DayStatus, string> = {
  degraded: "bg-amber-400 dark:bg-amber-300",
  down: "bg-rose-500 dark:bg-rose-400",
  none: "bg-muted",
  up: "bg-emerald-500 dark:bg-emerald-400",
};

type PulseStatusType = "up" | "degraded" | "down";

const PULSE_STATUS_CONFIG = {
  degraded: {
    color: "text-amber-600 dark:text-amber-400",
    icon: TriangleAlertIcon,
    label: "Degraded",
  },
  down: {
    color: "text-rose-600 dark:text-rose-400",
    icon: X,
    label: "Outage",
  },
  up: {
    color: "text-emerald-600 dark:text-emerald-400",
    icon: CircleCheck,
    label: "All systems operational",
  },
} as const;

interface PulseStatusProps extends React.ComponentProps<"p"> {
  count?: number;
  label?: string;
  status: PulseStatusType;
}

function PulseStatus({
  status,
  label,
  count,
  className,
  ...props
}: PulseStatusProps) {
  const config = PULSE_STATUS_CONFIG[status];
  const Icon = config.icon;
  const text =
    label ??
    (count === undefined
      ? config.label
      : count === 1
        ? "1 service affected"
        : `${count} services affected`);

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm",
        config.color,
        className
      )}
      data-slot="pulse-status"
      data-status={status}
      {...props}
    >
      <Icon aria-hidden className="size-4" />
      {text}
    </p>
  );
}

function Pulse({
  title = "System status",
  services = DEFAULT_SERVICES,
  days = 90,
  endDate = "2026-10-14",
  className,
}: PulseProps) {
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const sim = useRef({
    focus: null as number | null,
    last: 0,
    raf: 0,
    reduceMotion: false,
    target: new Float64Array(days).fill(1),
    weights: new Float64Array(days).fill(1),
  });
  if (sim.current.weights.length !== days) {
    sim.current.weights = new Float64Array(days).fill(1);
    sim.current.target = new Float64Array(days).fill(1);
  }

  const end = Date.parse(`${endDate}T00:00:00Z`);
  const dateOf = useCallback(
    (day: number) => end - (days - 1 - day) * DAY,
    [end, days]
  );
  const uptimes = useMemo(
    () => services.map((s) => uptimeOf(s, days)),
    [services, days]
  );
  const openIssues = services.filter(
    (s) => statusOf(s, days - 1) !== "up" && statusOf(s, days - 1) !== "none"
  );

  const paint = useCallback(() => {
    const rows = barsRef.current?.querySelectorAll<HTMLElement>("[data-row]");
    const { weights } = sim.current;
    for (const row of rows ?? []) {
      const bars = row.children;
      for (let i = 0; i < bars.length; i++) {
        (bars[i] as HTMLElement).style.flexGrow = weights[i].toFixed(3);
      }
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = sim.current;
      s.raf = 0;
      const dt = s.last ? Math.min((now - s.last) / 1000, 1 / 30) : 1 / 60;
      s.last = now;
      const k = 1 - Math.exp(-EASE * dt);
      let moving = false;
      for (let i = 0; i < s.weights.length; i++) {
        const gap = s.target[i] - s.weights[i];
        if (Math.abs(gap) > 0.002) {
          s.weights[i] += gap * k;
          moving = true;
        } else {
          s.weights[i] = s.target[i];
        }
      }
      paint();
      if (moving) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.last = 0;
      }
    },
    [paint]
  );

  const focusOn = useCallback(
    (focus: number | null) => {
      const s = sim.current;
      s.focus = focus;
      swell(s.weights.length, focus, s.target);
      if (s.reduceMotion) {
        s.weights.set(s.target);
        paint();
      } else if (!s.raf) {
        s.raf = requestAnimationFrame(tick);
      }
    },
    [paint, tick]
  );

  useEffect(() => {
    const s = sim.current;
    s.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  const dayAt = (clientX: number) => {
    const rect = barsRef.current?.getBoundingClientRect();
    if (!rect) {
      return 0;
    }
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const probe = new Float64Array(days);
    let day = Math.round(x * (days - 1));
    for (let pass = 0; pass < 3; pass++) {
      day = barAt(swell(days, day, probe), x);
    }
    return day;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" &&
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    const day = dayAt(event.clientX);
    if (day === active) {
      return;
    }
    setActive(day);
    focusOn(day);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    if (event.pointerType !== "mouse") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const day = dayAt(event.clientX);
    setActive(day);
    focusOn(day);
  };

  const handleClick = () => {
    if (active !== null) {
      setPinned((p) => (p === active ? null : active));
    }
  };

  const leave = () => {
    setActive(null);
    focusOn(pinned);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = active ?? pinned ?? days - 1;
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      End: days,
      Home: -days,
    };
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setPinned((p) => (p === from ? null : from));
      return;
    }
    if (event.key === "Escape") {
      setPinned(null);
      setActive(null);
      focusOn(null);
      return;
    }
    const move = moves[event.key];
    if (move === undefined) {
      return;
    }
    event.preventDefault();
    const day = clamp(from + move, 0, days - 1);
    setActive(day);
    focusOn(day);
  };

  const shownDay = active ?? pinned;
  const summary =
    shownDay === null
      ? "Hover a day to see what happened"
      : `${formatDay(dateOf(shownDay))} · ${describeDay(incidentsOn(services, shownDay))}`;
  const lastPinned = useRef<number | null>(null);
  if (pinned !== null) {
    lastPinned.current = pinned;
  }
  const logDay = pinned ?? lastPinned.current;
  const pinnedIncidents = logDay === null ? [] : incidentsOn(services, logDay);

  return (
    <Card
      className={cn(
        "w-full max-w-xl rounded-3xl select-none [--card-spacing:--spacing(5)]",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {openIssues.length ? (
            <PulseStatus count={openIssues.length} status="degraded" />
          ) : (
            <PulseStatus status="up" />
          )}
        </div>
        <CardDescription aria-live="polite" className="truncate tabular-nums">
          {summary}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          aria-label={`Daily status for the last ${days} days. Use the arrow keys to move between days and Enter to open one.`}
          aria-valuemax={days}
          aria-valuemin={1}
          aria-valuenow={(shownDay ?? days - 1) + 1}
          aria-valuetext={summary}
          className="focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer touch-pan-y rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
          onBlur={() => {
            if (active !== null) {
              leave();
            }
          }}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onLostPointerCapture={(event) => {
            if (event.target === event.currentTarget) {
              leave();
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") {
              leave();
            }
          }}
          onPointerMove={handlePointerMove}
          ref={barsRef}
          role="slider"
          tabIndex={0}
        >
          {services.map((service, row) => (
            <div className={cn(row > 0 && "mt-3")} key={service.name}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium">{service.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {uptimes[row].toFixed(2)}%
                </span>
              </div>
              <div className="flex h-7 gap-px sm:gap-[2px]" data-row>
                {Array.from({ length: days }, (_, day) => {
                  const status = statusOf(service, day);
                  const lit = day === shownDay;
                  return (
                    <div
                      className={cn(
                        "min-w-0 basis-0 rounded-[2px] transition-opacity duration-150 ease-out",
                        BAR_COLOR[status],
                        shownDay !== null && !lit && "opacity-60"
                      )}
                      key={day}
                      style={{ flexGrow: 1 }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div className="text-muted-foreground mt-2 flex justify-between text-xs">
            <span>{days} days ago</span>
            <span>Today</span>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-[260ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
            pinned === null
              ? "grid-rows-[0fr] opacity-0"
              : "grid-rows-[1fr] opacity-100"
          )}
          inert={pinned === null}
        >
          <div className="overflow-hidden">
            {logDay !== null && (
              <div className="bg-muted/50 mt-4 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {formatDay(dateOf(logDay))}
                  </p>
                  <button
                    aria-label="Close day"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring rounded-full p-1 transition-colors duration-150 ease-out outline-none focus-visible:ring-2"
                    onClick={() => {
                      setPinned(null);
                      focusOn(null);
                    }}
                    type="button"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </div>
                {pinnedIncidents.length === 0 && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    No incidents recorded. Every service was operational.
                  </p>
                )}
                {pinnedIncidents.map(({ service, incident }) => (
                  <div className="mt-3 first:mt-0" key={service}>
                    <p className="text-sm font-medium">{service}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <Badge
                        variant={
                          incident.status === "down"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {incident.status === "down" ? "Outage" : "Degraded"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {incident.title} · {incident.minutes} min
                      </span>
                    </p>
                    <Trace className="mt-2.5">
                      {incident.updates.map((update) => (
                        <TraceLine
                          className="w-full items-start"
                          key={`${update.time}-${update.label}`}
                        >
                          <TraceIcon className="mt-1.5">
                            <span className="bg-muted-foreground size-1.5 rounded-full" />
                          </TraceIcon>
                          <span className="min-w-0 flex-1">
                            <span className="text-muted-foreground tabular-nums">
                              {update.time}
                            </span>{" "}
                            <span className="font-medium">{update.label}</span>
                            {update.note && (
                              <span className="text-muted-foreground">
                                {" "}
                                {update.note}
                              </span>
                            )}
                          </span>
                        </TraceLine>
                      ))}
                    </Trace>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Pulse;
