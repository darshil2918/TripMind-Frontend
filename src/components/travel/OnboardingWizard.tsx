import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  CalendarDays,
  Users,
  Utensils,
  Sparkles,
  Link2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

export type TripBrief = {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  diet: string[];
  inspiration: string;
  budget: { food: number; sights: number; stay: number };
};

const dietOptions = ["Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Nut allergy", "Pescatarian"];

const steps = [
  { id: 1, label: "Destination" },
  { id: 2, label: "Who & how" },
  { id: 3, label: "Inspiration" },
  { id: 4, label: "Budget mix" },
];

export function OnboardingWizard({ onComplete }: { onComplete: (b: TripBrief) => void }) {
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState<TripBrief>({
    destination: "Lisbon, Portugal",
    startDate: "2026-06-12",
    endDate: "2026-06-18",
    travelers: "2 adults, 1 child (8)",
    diet: ["Vegetarian"],
    inspiration: "",
    budget: { food: 40, sights: 35, stay: 25 },
  });

  const update = <K extends keyof TripBrief>(k: K, v: TripBrief[K]) =>
    setBrief((p) => ({ ...p, [k]: v }));

  const toggleDiet = (d: string) =>
    setBrief((p) => ({
      ...p,
      diet: p.diet.includes(d) ? p.diet.filter((x) => x !== d) : [...p.diet, d],
    }));

  const setBudget = (key: keyof TripBrief["budget"], val: number) => {
    setBrief((p) => {
      const others = (Object.keys(p.budget) as Array<keyof TripBrief["budget"]>).filter((k) => k !== key);
      const remaining = 100 - val;
      const otherSum = others.reduce((a, k) => a + p.budget[k], 0) || 1;
      const scaled = others.reduce(
        (acc, k) => ({ ...acc, [k]: Math.round((p.budget[k] / otherSum) * remaining) }),
        {} as Record<string, number>
      );
      return { ...p, budget: { ...p.budget, ...scaled, [key]: val } as TripBrief["budget"] };
    });
  };

  const next = () => (step < 4 ? setStep(step + 1) : onComplete(brief));
  const back = () => step > 1 && setStep(step - 1);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 animate-fade-in">
      <div className="mb-10 text-center">
        <Badge variant="secondary" className="mb-4 rounded-full bg-primary-soft text-accent-foreground border-0 px-3 py-1">
          <Sparkles className="mr-1.5 h-3 w-3" /> AI travel planner
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Let's design your trip
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          A few details and we'll draft a hyper-personal itinerary in seconds.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-10 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                step > s.id
                  ? "bg-primary text-primary-foreground"
                  : step === s.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ? <Check className="h-4 w-4" /> : s.id}
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-px flex-1 transition-colors ${step > s.id ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border bg-card p-8 shadow-soft">
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <h2 className="text-xl font-semibold">Where & when?</h2>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <MapPin className="mr-1 inline h-3 w-3" /> Destination
              </Label>
              <Input
                value={brief.destination}
                onChange={(e) => update("destination", e.target.value)}
                className="h-12 rounded-xl"
                placeholder="City, region, or country"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <CalendarDays className="mr-1 inline h-3 w-3" /> Start
                </Label>
                <Input
                  type="date"
                  value={brief.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  End
                </Label>
                <Input
                  type="date"
                  value={brief.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            <h2 className="text-xl font-semibold">Who's coming along?</h2>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Users className="mr-1 inline h-3 w-3" /> Group composition
              </Label>
              <Input
                value={brief.travelers}
                onChange={(e) => update("travelers", e.target.value)}
                className="h-12 rounded-xl"
                placeholder="e.g. 2 adults, 1 child (8)"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Utensils className="mr-1 inline h-3 w-3" /> Dietary restrictions
              </Label>
              <div className="flex flex-wrap gap-2">
                {dietOptions.map((d) => {
                  const active = brief.diet.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDiet(d)}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <h2 className="text-xl font-semibold">Paste your inspiration</h2>
            <p className="text-sm text-muted-foreground">
              Drop links to Reels, TikToks, or YouTube clips. We'll pull places, vibes, and reference them in your plan.
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Link2 className="mr-1 inline h-3 w-3" /> Inspiration links
              </Label>
              <Textarea
                value={brief.inspiration}
                onChange={(e) => update("inspiration", e.target.value)}
                className="min-h-32 resize-none rounded-xl"
                placeholder={"https://instagram.com/reel/...\nhttps://tiktok.com/@.../video/...\nhttps://youtu.be/..."}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-xl font-semibold">Balance your budget</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag the sliders. The mix re-balances automatically.
              </p>
            </div>
            {[
              { key: "food" as const, label: "Local food", hint: "Markets, street food, neighborhood gems" },
              { key: "sights" as const, label: "Sights & experiences", hint: "Museums, tours, landmarks" },
              { key: "stay" as const, label: "Stay & comfort", hint: "Hotels, transit upgrades" },
            ].map((b) => (
              <div key={b.key} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-medium">{b.label}</div>
                    <div className="text-xs text-muted-foreground">{b.hint}</div>
                  </div>
                  <div className="text-base font-semibold tabular-nums text-primary">{brief.budget[b.key]}%</div>
                </div>
                <Slider
                  value={[brief.budget[b.key]]}
                  min={5}
                  max={90}
                  step={5}
                  onValueChange={(v) => setBudget(b.key, v[0])}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 1}
          className="rounded-full"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={next} className="rounded-full px-6 h-11">
          {step === 4 ? "Generate blueprint" : "Continue"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}