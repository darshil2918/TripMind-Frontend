import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, MapPin, Sun, Cloud, ArrowRight, ArrowLeft } from "lucide-react";
import type { TripBrief } from "./OnboardingWizard";

export type DayPlan = {
  id: string;
  day: number;
  city: string;
  theme: string;
  highlights: string[];
  weather: "sun" | "cloud";
  temp: string;
};

const seedDays: DayPlan[] = [
  { id: "d1", day: 1, city: "Lisbon · Alfama", theme: "Old town arrival", highlights: ["Castelo de S. Jorge", "Fado dinner"], weather: "sun", temp: "26°" },
  { id: "d2", day: 2, city: "Lisbon · Belém", theme: "Coast & pastries", highlights: ["Jerónimos", "Pastéis de Belém", "MAAT"], weather: "sun", temp: "27°" },
];

export function Blueprint({ brief, itinerary, onBack, onConfirm }: { brief: TripBrief; itinerary: string | null; onBack: () => void; onConfirm: () => void }) {

  // 🌟 BULLETPROOF DATA PARSER
  let aiDays: DayPlan[] = [];
  if (itinerary) {
    try {
      // This hunts for the [ ] array brackets, ignoring any polite conversational text the AI adds!
      const jsonMatch = itinerary.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiDays = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("The AI did not return perfect JSON!", e);
    }
  }

  // 🌟 STATE INJECTION
  const [days, setDays] = useState<DayPlan[]>(aiDays.length > 0 ? aiDays : seedDays);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...days];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    setDays(next.map((d, idx) => ({ ...d, day: idx + 1 })));
    setDragIdx(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-3 rounded-full bg-primary-soft text-accent-foreground border-0">
            Step 2 · Blueprint
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Rough blueprint</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag the day cards to re-order before we lock in the hour-by-hour plan for{" "}
            <span className="font-medium text-foreground">{brief.destination}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <ArrowLeft className="mr-1 h-4 w-4" /> Edit brief
          </Button>
          <Button onClick={onConfirm} className="rounded-full h-11 px-6">
            Lock in & detail <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="-mx-6 overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4 px-6">
          {days.map((d, i) => (
            <div
              key={d.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              className={`group w-72 shrink-0 rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft ${
                dragIdx === i ? "opacity-40" : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background">
                    {d.day}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Day {d.day}
                  </span>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="text-lg font-semibold leading-tight">{d.city}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.theme}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {d.weather === "sun" ? <Sun className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
                <span>{d.temp}</span>
                <span>·</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{d.highlights.length} stops</span>
              </div>
              <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                {d.highlights.map((h) => (
                  <div key={h} className="text-sm text-foreground/80">
                    · {h}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Tip — drag cards horizontally to swap days.
      </p>
    </div>
  );
}