"use client";

import { useMemo, useState } from "react";
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps
} from "@xyflow/react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Clock3, GitBranch, Lock, Route, Sparkles } from "lucide-react";
import { SourceEmpty } from "@/components/ui/source-empty";

type DependencyItem = {
  id: string;
  label: string;
  dependsOn: string[];
  why?: string;
};

type RouteFilter = "food" | "export" | "all";
type StepRoute = "food" | "export" | "shared";
type StepKind = "profile" | "mandatory" | "scheme" | "skip";
type StepStatus = "done" | "ready" | "blocked" | "queued" | "locked";

type QuestNodeData = {
  label: string;
  subtitle: string;
  route: StepRoute;
  week: number;
  kind: StepKind;
  status: StepStatus;
  badge: string;
  why: string;
  dependsOn: string[];
  dependents: string[];
  authority: string;
  isContext: boolean;
};

type QuestNode = Node<QuestNodeData, "quest">;
type QuestEdge = Edge<{ kind: StepKind; label: string }, "quest">;

const maxWeekStart = 4;

const kindCopy: Record<StepKind, { label: string; className: string; dot: string; edge: string; glow: string }> = {
  profile: {
    label: "Profile",
    className: "border-zinc-300 bg-zinc-950 text-white",
    dot: "bg-zinc-950",
    edge: "#111827",
    glow: "shadow-zinc-300/40"
  },
  mandatory: {
    label: "Mandatory",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-600",
    edge: "#2563eb",
    glow: "shadow-blue-200/70"
  },
  scheme: {
    label: "Scheme unlock",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    edge: "#f59e0b",
    glow: "shadow-amber-200/80"
  },
  skip: {
    label: "Rule check",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-600",
    edge: "#059669",
    glow: "shadow-emerald-200/70"
  }
};

const statusCopy: Record<StepStatus, { label: string; className: string }> = {
  done: { label: "Done", className: "bg-emerald-50 text-emerald-700" },
  ready: { label: "Ready", className: "bg-blue-50 text-blue-700" },
  blocked: { label: "Blocked", className: "bg-rose-50 text-rose-700" },
  queued: { label: "Queued", className: "bg-amber-50 text-amber-800" },
  locked: { label: "Locked", className: "bg-zinc-100 text-zinc-600" }
};

const routeTabs: Array<{ value: RouteFilter; label: string; description: string }> = [
  { value: "food", label: "Food route", description: "Priya's cloud kitchen setup" },
  { value: "export", label: "Export route", description: "Rahul's merchant exporter path" },
  { value: "all", label: "All routes", description: "Source-backed dependency graph" }
];

function enrichDependencyItems(items: DependencyItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]));

  return items.map((item) => {
    const route = getRoute(item.id);
    const kind = getKind(item.id);
    const week = getWeek(item.id);
    const dependents = items.filter((candidate) => candidate.dependsOn.includes(item.id)).map((candidate) => candidate.id);

    return {
      ...item,
      route,
      kind,
      week,
      status: getStatus(item.id),
      subtitle: getSubtitle(item.id),
      badge: getBadge(item.id),
      authority: getAuthority(item.id, byId.get(item.id)?.label ?? item.label),
      dependents
    };
  });
}

function getRoute(id: string): StepRoute {
  if (["food-profile", "fssai", "gst-food", "trade-license", "pmfme", "pmegp"].includes(id)) return "food";
  if (["export-profile", "iec", "icegate", "ad-code", "rcmc", "apeda", "gst-lut", "shipping-bill", "rodtep"].includes(id)) return "export";
  return "shared";
}

function getKind(id: string): StepKind {
  if (id.endsWith("profile")) return "profile";
  if (["pmfme", "pmegp", "apeda", "rodtep"].includes(id)) return "scheme";
  if (["gst-food", "gst-lut"].includes(id)) return "skip";
  return "mandatory";
}

function getWeek(id: string) {
  const weeks: Record<string, number> = {
    "food-profile": 1,
    "export-profile": 1,
    udyam: 1,
    fssai: 1,
    iec: 1,
    "gst-food": 2,
    "trade-license": 2,
    icegate: 2,
    "ad-code": 2,
    rcmc: 2,
    pmfme: 3,
    "gst-lut": 3,
    apeda: 3,
    pmegp: 4,
    "shipping-bill": 4,
    rodtep: 5
  };

  return weeks[id] ?? 3;
}

function getStatus(id: string): StepStatus {
  const statuses: Record<string, StepStatus> = {
    "food-profile": "done",
    "export-profile": "done",
    iec: "done",
    udyam: "ready",
    fssai: "ready",
    "gst-food": "queued",
    "trade-license": "blocked",
    pmfme: "queued",
    pmegp: "locked",
    icegate: "ready",
    "ad-code": "blocked",
    rcmc: "ready",
    "gst-lut": "queued",
    apeda: "queued",
    "shipping-bill": "locked",
    rodtep: "locked"
  };

  return statuses[id] ?? "queued";
}

function getSubtitle(id: string) {
  const subtitles: Record<string, string> = {
    "food-profile": "Business intake",
    "export-profile": "Exporter intake",
    udyam: "MSME identity",
    fssai: "Food safety license",
    "gst-food": "Turnover applicability",
    "trade-license": "Local authority",
    pmfme: "Food processing scheme",
    pmegp: "Credit-linked subsidy",
    iec: "DGFT exporter identity",
    icegate: "Customs access",
    "ad-code": "Bank-port mapping",
    rcmc: "Export council route",
    apeda: "Agri/processed food export",
    "gst-lut": "Export tax route",
    "shipping-bill": "Customs filing",
    rodtep: "Remission check"
  };

  return subtitles[id] ?? "Dependency step";
}

function getBadge(id: string) {
  const badges: Record<string, string> = {
    "food-profile": "Start",
    "export-profile": "Start",
    udyam: "MSME",
    fssai: "Food",
    "gst-food": "Check",
    "trade-license": "Local",
    pmfme: "Scheme",
    pmegp: "Loan",
    iec: "DGFT",
    icegate: "Customs",
    "ad-code": "Bank",
    rcmc: "Council",
    apeda: "Export",
    "gst-lut": "GST",
    "shipping-bill": "Shipment",
    rodtep: "Incentive"
  };

  return badges[id] ?? "Step";
}

function getAuthority(id: string, fallback: string) {
  const authorities: Record<string, string> = {
    "food-profile": "Founder profile engine",
    "export-profile": "Founder profile engine",
    udyam: "Ministry of MSME",
    fssai: "FSSAI / FoSCoS",
    "gst-food": "GST portal / CBIC",
    "trade-license": "Local municipal authority",
    pmfme: "Ministry of Food Processing Industries",
    pmegp: "KVIC / Ministry of MSME",
    iec: "DGFT",
    icegate: "CBIC / ICEGATE",
    "ad-code": "Authorized Dealer Bank / Customs",
    rcmc: "Export Promotion Council",
    apeda: "APEDA",
    "gst-lut": "GST portal",
    "shipping-bill": "Indian Customs",
    rodtep: "DGFT / Customs"
  };

  return authorities[id] ?? fallback;
}

function QuestNodeCard({ data, selected }: NodeProps<QuestNode>) {
  const kind = kindCopy[data.kind];
  const status = statusCopy[data.status];
  const isLocked = data.status === "locked";
  const isBlocked = data.status === "blocked";

  return (
    <div
      className={[
        "group relative w-[250px] rounded-lg border bg-white p-4 shadow-sm transition-all duration-200",
        data.isContext ? "opacity-50 saturate-50" : "opacity-100",
        selected ? `border-teal-700 shadow-2xl ${kind.glow}` : "border-zinc-200 hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-xl",
        isLocked ? "bg-zinc-50" : "",
        isBlocked ? "border-rose-200" : ""
      ].join(" ")}
    >
      <Handle className="!h-3 !w-3 !border-2 !border-white !bg-zinc-400" position={Position.Left} type="target" />
      <Handle className="!h-3 !w-3 !border-2 !border-white !bg-teal-700" position={Position.Right} type="source" />

      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${kind.className}`}>{data.badge}</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span>
      </div>

      <div className="mt-4 min-h-[68px]">
        <div className="text-lg font-black leading-tight text-zinc-950">{data.label}</div>
        <div className="mt-2 text-sm font-medium leading-snug text-zinc-500">{data.subtitle}</div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
        <span>Week {data.week}</span>
        <span className="truncate">{data.authority}</span>
      </div>
    </div>
  );
}

function QuestEdgeLine({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps<QuestEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.38
  });
  const kind = kindCopy[data?.kind ?? "mandatory"];
  const isScheme = data?.kind === "scheme";

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          stroke: kind.edge,
          strokeWidth: isScheme ? 5 : 3,
          strokeDasharray: data?.kind === "skip" ? "8 8" : undefined,
          filter: isScheme ? "drop-shadow(0 10px 16px rgba(245, 158, 11, 0.28))" : undefined
        }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 shadow-sm"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const nodeTypes = { quest: QuestNodeCard };
const edgeTypes = { quest: QuestEdgeLine };

export function DependencyMap({ items }: { items: DependencyItem[] }) {
  const [route, setRoute] = useState<RouteFilter>("food");
  const [weekStart, setWeekStart] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const enriched = useMemo(() => enrichDependencyItems(items), [items]);

  const routeItems = useMemo(
    () =>
      enriched.filter((item) => {
        if (route === "all") return true;
        return item.route === route || item.route === "shared";
      }),
    [enriched, route]
  );

  const visibleIds = useMemo(() => {
    const inWindow = routeItems.filter((item) => item.week === weekStart || item.week === weekStart + 1).map((item) => item.id);
    const context = routeItems
      .filter((item) => {
        const connectedToWindow = item.dependsOn.some((dependency) => inWindow.includes(dependency)) || item.dependents.some((dependent) => inWindow.includes(dependent));
        return connectedToWindow && Math.abs(item.week - weekStart) <= 2;
      })
      .map((item) => item.id);

    return new Set([...inWindow, ...context]);
  }, [routeItems, weekStart]);

  const flowItems = routeItems.filter((item) => visibleIds.has(item.id));
  const nodeIds = new Set(flowItems.map((item) => item.id));

  const selectedItem = routeItems.find((item) => item.id === selectedId) ?? routeItems.find((item) => item.week === weekStart || item.week === weekStart + 1) ?? routeItems[0];

  const nodes: QuestNode[] = flowItems.map((item) => {
    const column = getColumn(item.week, weekStart);
    const rowIndex = flowItems.filter((candidate) => getColumn(candidate.week, weekStart) === column).findIndex((candidate) => candidate.id === item.id);
    const routeOffset = route === "all" && item.route === "export" ? 70 : 0;

    return {
      id: item.id,
      type: "quest",
      position: {
        x: 70 + column * 360,
        y: 105 + rowIndex * 150 + routeOffset
      },
      data: {
        label: item.label,
        subtitle: item.subtitle,
        route: item.route,
        week: item.week,
        kind: item.kind,
        status: item.status,
        badge: item.badge,
        why: item.why ?? "Dependency reason stored in the verified rule corpus.",
        dependsOn: item.dependsOn,
        dependents: item.dependents,
        authority: item.authority,
        isContext: item.week < weekStart || item.week > weekStart + 1
      }
    };
  });

  const edges: QuestEdge[] = flowItems.flatMap((item) =>
    item.dependsOn
      .filter((dependency) => nodeIds.has(dependency))
      .map((dependency) => ({
        id: `${dependency}-${item.id}`,
        source: dependency,
        target: item.id,
        type: "quest",
        animated: item.kind !== "profile",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: kindCopy[item.kind].edge,
          width: 18,
          height: 18
        },
        data: {
          kind: item.kind,
          label: item.kind === "scheme" ? "Unlock" : item.kind === "skip" ? "Check" : ""
        }
      }))
  );

  if (items.length === 0) return <SourceEmpty title="Dependency graph is loading" detail="The curated food and export/import route map will appear here." />;

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-50/80 p-4 lg:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-teal-700">
              <GitBranch className="h-4 w-4" />
              Interactive dependency route
            </div>
            <p className="mt-2 max-w-2xl text-sm font-medium text-zinc-500">Slide through weeks, switch business routes, and click any step to see why it unlocks the next workflow.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {routeTabs.map((tab) => (
              <button
                className={[
                  "rounded-lg border px-4 py-3 text-left transition hover:border-teal-600 hover:bg-teal-50",
                  route === tab.value ? "border-teal-700 bg-teal-50 shadow-sm" : "border-zinc-200 bg-white"
                ].join(" ")}
                key={tab.value}
                onClick={() => {
                  setRoute(tab.value);
                  setSelectedId(null);
                  setWeekStart(1);
                }}
                type="button"
              >
                <span className="block text-sm font-black text-zinc-950">{tab.label}</span>
                <span className="mt-1 block text-xs font-medium text-zinc-500">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <button
              aria-label="Previous weeks"
              className="grid h-12 w-12 place-items-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={weekStart === 1}
              onClick={() => setWeekStart((current) => Math.max(1, current - 1))}
              type="button"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <input
              aria-label="Slide weeks"
              className="h-2 flex-1 accent-teal-700"
              max={maxWeekStart}
              min={1}
              onChange={(event) => setWeekStart(Number(event.target.value))}
              type="range"
              value={weekStart}
            />
            <button
              aria-label="Next weeks"
              className="grid h-12 w-12 place-items-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={weekStart === maxWeekStart}
              onClick={() => setWeekStart((current) => Math.min(maxWeekStart, current + 1))}
              type="button"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
            <span className="hidden whitespace-nowrap text-sm font-black uppercase tracking-[0.18em] text-zinc-500 md:inline">Slide weeks</span>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 border-b border-zinc-200 xl:border-b-0 xl:border-r">
          <div className="grid grid-cols-2 border-b border-zinc-200 bg-white text-center">
            {[weekStart, weekStart + 1].map((week) => (
              <div className="border-r border-zinc-200 p-4 last:border-r-0" key={week}>
                <div className="mx-auto max-w-sm rounded-full border border-teal-100 bg-teal-50 px-5 py-3 text-lg font-black uppercase tracking-[0.12em] text-teal-700">Week {week}</div>
              </div>
            ))}
          </div>
          <div className="h-[620px] bg-gradient-to-br from-white via-white to-zinc-50">
            <ReactFlow
              edgeTypes={edgeTypes}
              edges={edges}
              fitView
              fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
              nodes={nodes}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#d7dde8" gap={28} size={1.1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 bg-white p-4">
            {(Object.keys(kindCopy) as StepKind[]).map((kind) => (
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-black text-zinc-500" key={kind}>
                <span className={`h-2.5 w-2.5 rounded-full ${kindCopy[kind].dot}`} />
                {kindCopy[kind].label}
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-zinc-50 p-5">
          {selectedItem ? (
            <div className="sticky top-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${kindCopy[selectedItem.kind].className}`}>{selectedItem.badge}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${statusCopy[selectedItem.status].className}`}>{statusCopy[selectedItem.status].label}</span>
              </div>
              <h3 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">{selectedItem.label}</h3>
              <p className="mt-2 text-sm font-medium text-zinc-500">{selectedItem.subtitle}</p>

              <div className="mt-5 grid gap-3">
                <InfoRow icon={<Route className="h-4 w-4" />} label="Authority" value={selectedItem.authority} />
                <InfoRow icon={<Clock3 className="h-4 w-4" />} label="Window" value={`Week ${selectedItem.week}`} />
                <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="Unlocks" value={selectedItem.dependents.length ? selectedItem.dependents.join(", ") : "End of current route"} />
                <InfoRow icon={<Lock className="h-4 w-4" />} label="Depends on" value={selectedItem.dependsOn.length ? selectedItem.dependsOn.join(", ") : "Profile data"} />
              </div>

              <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                  <Sparkles className="h-4 w-4" />
                  Why this step
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">{selectedItem.why ?? "Dependency reason stored in verified rule corpus."}</p>
              </div>

              {selectedItem.status === "blocked" ? (
                <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
                  <div className="flex items-center gap-2 font-black">
                    <CircleAlert className="h-4 w-4" />
                    Blocked right now
                  </div>
                  <p className="mt-2">Collect the missing input before this branch unlocks downstream registrations or schemes.</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function getColumn(week: number, weekStart: number) {
  if (week < weekStart) return -1;
  if (week > weekStart + 1) return 2;
  return week - weekStart;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-bold leading-5 text-zinc-700">{value}</p>
    </div>
  );
}
