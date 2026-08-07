import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  GripVertical,
  Plus,
  Hotel,
  Train,
  Tag,
  Utensils,
  Leaf,
  Sparkles,
  AlertTriangle,
  Users,
  Map as MapIcon,
  ShoppingBag,
  Pill,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import type { TripBrief } from "./OnboardingWizard";

type Crowd = "low" | "med" | "high";
type Block = {
  id: string;
  time: string;
  title: string;
  place?: string;
  duration: string;
  type: "activity" | "meal" | "transit" | "flex";
  crowd?: Crowd;
  alert?: { kind: "scam" | "overcharge"; text: string };
  bestTime?: string;
};

const seedBlocks: Block[] = [
  { id: "b1", time: "08:00", title: "Breakfast at Dear Breakfast", place: "Príncipe Real", duration: "1h", type: "meal" },
  { id: "b2", time: "09:30", title: "Castelo de São Jorge", place: "Alfama", duration: "2h", type: "activity", crowd: "high", bestTime: "Best before 10:30" },
  { id: "b3", time: "12:00", title: "Flexible · explore Alfama lanes", duration: "1h", type: "flex" },
  { id: "b4", time: "13:00", title: "Lunch — Ti-Natércia (vegetarian menu)", place: "Alfama", duration: "1h 15m", type: "meal" },
  {
    id: "b5",
    time: "15:00",
    title: "Tram 28 ride to Graça",
    duration: "45m",
    type: "transit",
    alert: { kind: "scam", text: "Pickpocket hotspot — keep bags front-facing" },
  },
  { id: "b6", time: "16:30", title: "Miradouro da Senhora do Monte", place: "Graça", duration: "45m", type: "activity", crowd: "med" },
  { id: "b7", time: "18:00", title: "Flexible · sunset wandering", duration: "1h 30m", type: "flex" },
  {
    id: "b8",
    time: "20:00",
    title: "Fado dinner — Tasca do Chico",
    place: "Bairro Alto",
    duration: "2h",
    type: "meal",
    alert: { kind: "overcharge", text: "Confirm couvert charges before ordering" },
  },
];

const stays = [
  { name: "Memmo Alfama", area: "Alfama", price: "€210", tag: "Closest to old town", rating: 4.8 },
  { name: "Hotel das Amoreiras", area: "Amoreiras", price: "€165", tag: "Best price · 4★", rating: 4.6 },
  { name: "The Lumiares", area: "Bairro Alto", price: "€245", tag: "Near nightlife", rating: 4.7 },
];

const transit = [
  { label: "Lisbon Card · 72h", price: "€42", deal: "Save €12 vs separate tickets" },
  { label: "Airport Aerobus return", price: "€7.20", deal: "20% off pre-book" },
];

const dining = [
  { name: "Ti-Natércia", tags: ["Vegetarian", "Family-friendly"], distance: "0.4 km", price: "€€" },
  { name: "Ao 26 Vegan Food Project", tags: ["Vegan", "Vegetarian"], distance: "0.9 km", price: "€€" },
  { name: "The Food Temple", tags: ["Vegetarian", "Wine"], distance: "0.6 km", price: "€€€" },
];

const hiddenGems = [
  { title: "Tile painting at a 4th-gen azulejo studio", duration: "90 min", area: "Marvila" },
  { title: "Sunrise kayak under the 25 de Abril bridge", duration: "2 h", area: "Doca de Santo Amaro" },
  { title: "Goat & olive farm visit + tasting", duration: "Half day", area: "Outside Sintra" },
];

const utilities = [
  { icon: ShoppingBag, name: "Pingo Doce supermarket", meta: "On route · 7 min walk" },
  { icon: Pill, name: "Farmácia Estácio (24h)", meta: "Near hotel" },
  { icon: Coffee, name: "Copenhagen Coffee Lab", meta: "Quick caffeine stop" },
];

function CrowdMeter({ level }: { level: Crowd }) {
  const cfg = {
    low: { label: "Calm", bars: 1, color: "bg-success" },
    med: { label: "Moderate", bars: 2, color: "bg-warning" },
    high: { label: "Busy", bars: 3, color: "bg-destructive" },
  }[level];
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Users className="h-3 w-3" />
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map((b) => (
          <div
            key={b}
            className={`w-0.5 ${b <= cfg.bars ? cfg.color : "bg-border"}`}
            style={{ height: `${b * 3 + 2}px` }}
          />
        ))}
      </div>
      {cfg.label}
    </div>
  );
}

export function Dashboard({ brief, itinerary, onReset }: { brief: TripBrief; itinerary: string | null; onReset: () => void }) {
  // 🌟 BULLETPROOF MEGA-JSON PARSER
  let aiDays: any[] = [];
  if (itinerary) {
    try {
      const jsonMatch = itinerary.match(/\[[\s\S]*\]/);
      if (jsonMatch) aiDays = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("AI did not return perfect JSON!", e);
    }
  }

  // Assuming Lovable created a state for the currently selected day (e.g., day 1, day 2)
  // It might look like: const [activeDay, setActiveDay] = useState(0);

  // 🌟 DATA OVERRIDE: If the AI successfully generated data, use it! Otherwise fallback to mock data.
  const isAiActive = aiDays.length > 0;
  // NOTE: Replace '0' with whatever state variable tracks the currently selected day in the carousel
  const [day, setDay] = useState(1);
  const currentAiDay = isAiActive ? aiDays[day - 1] : null;

  // 🌟 THE REAL DRAG & DROP STATE
  const [blocks, setBlocks] = useState<any[]>(seedBlocks);
  const [routeUtils, setRouteUtils] = useState(true);
  const [drag, setDrag] = useState<number | null>(null);

  // 🌟 THE SYNC MECHANISM
  // Whenever the AI data loads, OR whenever you click to Day 2, Day 3, etc.,
  // this copies the correct daily schedule into the draggable 'blocks' state.
  const dayDateLabel = (() => {
    if (!brief.startDate) return "";
    const d = new Date(brief.startDate);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + (day - 1));
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  })();
  useEffect(() => {
    if (currentAiDay?.timeline) {
      setBlocks(currentAiDay.timeline);
    } else {
      setBlocks(seedBlocks);
    }
  }, [day, currentAiDay]);

  // 🌟 THE FULL ONDROP FUNCTION (Restored!)
  const onDragStart = (i: number) => setDrag(i);
  const onDrop = (i: number) => {
    if (drag === null || drag === i) return;
    const next = [...blocks];
    const [m] = next.splice(drag, 1);
    next.splice(i, 0, m);

    setBlocks(next); // Saves the newly dragged order!
    setDrag(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Badge variant="secondary" className="rounded-full bg-primary-soft text-accent-foreground border-0">
              <Sparkles className="mr-1 h-3 w-3" /> Live itinerary
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{brief.destination}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {brief.startDate} → {brief.endDate} · {brief.travelers}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card p-1 shadow-card">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => setDay((d) => Math.max(1, d - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
            <div className="px-3 text-sm font-medium tabular-nums">Day {day}{dayDateLabel ? ` · ${dayDateLabel}` : ""}</div>          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => setDay((d) => Math.min(isAiActive ? aiDays.length : 7, d + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Timeline */}
        <section className="col-span-12 rounded-3xl border bg-card p-6 shadow-card lg:col-span-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Today's timeline</h2>
              <p className="text-xs text-muted-foreground">Drag blocks to reorder · tap flex slots to add</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add block
            </Button>
          </div>

          <ol className="relative">
            <div className="absolute left-[58px] top-2 bottom-2 w-px bg-border" />
            {blocks.map((b: any, i: number) => (
              <li
                key={b.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="relative flex gap-4 pb-4"
              >

                <div className="w-12 pt-2 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {b.time}
                </div>
                <div className="relative mt-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ring-4 ring-card ${
                      b.type === "flex" ? "bg-border" : "bg-primary"
                    }`}
                  />
                </div>
                <div
                  className={`group flex-1 rounded-2xl border p-4 transition-all hover:shadow-soft ${
                    b.type === "flex"
                      ? "border-dashed bg-background"
                      : "border-transparent bg-secondary"
                  } ${drag === i ? "opacity-40" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {b.type === "meal" && <Utensils className="h-3.5 w-3.5 text-muted-foreground" />}
                        {b.type === "transit" && <Train className="h-3.5 w-3.5 text-muted-foreground" />}
                        <div className={`truncate text-sm font-medium ${b.type === "flex" ? "text-muted-foreground" : "text-foreground"}`}>
                          {b.title}
                        </div>
                      </div>
                      {b.place && (
                        <div className="mt-0.5 text-xs text-muted-foreground">{b.place}</div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {b.duration}
                        </span>
                        {b.crowd && <CrowdMeter level={b.crowd} />}
                        {b.bestTime && (
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                            {b.bestTime}
                          </span>
                        )}
                      </div>
                      {b.alert && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-warning-foreground">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <div>
                            <span className="font-medium">
                              {b.alert.kind === "scam" ? "Scam alert" : "Overcharge risk"}
                            </span>{" "}
                            · {b.alert.text}
                          </div>
                        </div>
                      )}
                    </div>
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Right column */}
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-5">
          {/* Map */}
          <section className="rounded-3xl border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Today's route</h2>
                <p className="text-xs text-muted-foreground">5 stops · 6.4 km · 38 min walking</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={routeUtils}
                  onChange={(e) => setRouteUtils(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--primary)]"
                />
                Show en-route utilities
              </label>
            </div>
            <div className="relative h-48 overflow-hidden rounded-2xl border bg-gradient-hero">
              <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="oklch(0.85 0.02 260 / 0.5)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid)" />
                <path
                  d="M40,160 C 100,140 130,80 200,90 S 320,140 360,40"
                  stroke="oklch(0.52 0.22 275)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  fill="none"
                />
                {[
                  [40, 160],
                  [140, 100],
                  [220, 90],
                  [300, 110],
                  [360, 40],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="6" fill="oklch(0.52 0.22 275)" />
                    <circle cx={x} cy={y} r="11" fill="oklch(0.52 0.22 275 / 0.2)" />
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                <MapIcon className="h-3 w-3" /> Map preview
              </div>
            </div>
            {routeUtils && (
              <div className="mt-4 space-y-2">
                {(currentAiDay?.utilities || utilities).map((u: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card shadow-card">
                      <MapIcon className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">{u.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Hidden gems */}
          <section className="relative overflow-hidden rounded-3xl border bg-foreground p-6 text-background shadow-card">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary opacity-30 blur-3xl" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                  Off the beaten path
                </span>
              </div>
              <h2 className="text-lg font-semibold">Hidden gems for your group</h2>
              <p className="mt-1 text-xs opacity-70">Curated from local blogs · matched to your interests</p>
              <ul className="mt-4 space-y-3">
                {(currentAiDay?.hidden_gems || hiddenGems).map((g: any) => (
                  <li
                    key={g.title}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-background/5 p-3 transition-colors hover:bg-background/10"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{g.title}</div>
                      <div className="mt-0.5 text-[11px] opacity-60">
                        {g.area} · {g.duration}
                      </div>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 shrink-0 rounded-full bg-background text-foreground hover:bg-background/90"
                        onClick={() => addHiddenGemToTimeline(g)}
                    >
                        Add
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Stays */}
        <section className="col-span-12 rounded-3xl border bg-card p-6 shadow-card lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Stays & transit</h2>
            </div>
            <button className="text-xs font-medium text-primary hover:underline">See all</button>
          </div>
          <div className="space-y-3">
            {(currentAiDay?.stays || stays).map((s: any, idx: number) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-2xl border border-transparent bg-secondary p-3 transition-colors hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
                    <Hotel className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.area} · {s.rating}★
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{s.price}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-primary">{s.tag}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="my-5 h-px bg-border" />
          <div className="space-y-2">
            {(currentAiDay?.transit || transit).map((t: any, idx: number) => (
              <div key={t.label} className="flex items-center justify-between rounded-2xl bg-secondary p-3">
                <div className="flex items-center gap-3">
                  <Train className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                      <Tag className="h-2.5 w-2.5" /> {t.deal}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{t.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Dining */}
        <section className="col-span-12 rounded-3xl border bg-card p-6 shadow-card lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Hyper-local dining</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Filtered for {brief.diet.join(", ").toLowerCase() || "your tastes"}
              </p>
            </div>
            <div className="flex gap-1.5">
              {brief.diet.slice(0, 3).map((d) => (
                <Badge key={d} variant="secondary" className="rounded-full bg-primary-soft text-accent-foreground border-0 text-[10px]">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(currentAiDay?.dining || dining).map((d: any, idx: number) => (
              <div
                key={d.name}
                className="group rounded-2xl border bg-background p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-gradient-hero">
                  <Utensils className="h-6 w-6 text-foreground/30" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold">{d.name}</div>
                  <span className="text-xs font-medium text-muted-foreground">{d.price}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{d.distance} away</div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {d.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}