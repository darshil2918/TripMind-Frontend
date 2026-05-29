import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingWizard, type TripBrief } from "@/components/travel/OnboardingWizard";
import { Blueprint } from "@/components/travel/Blueprint";
import { Dashboard } from "@/components/travel/Dashboard";
import { Compass } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripMind-AI" },
      { name: "description", content: "Hyper-personalized, dynamic travel itineraries crafted around your group, taste, and budget." },
      { property: "og:title", content: "TripMind-AI" },
      { property: "og:description", content: "Hyper-personalized, dynamic travel itineraries crafted around your group, taste, and budget." },
    ],
  }),
  component: Index,
});

function Index() {
  const [stage, setStage] = useState<"wizard" | "blueprint" | "dashboard">("wizard");
  const [brief, setBrief] = useState<TripBrief | null>(null);

  // 🌟 NEW STATES: To hold the AI response and show a beautiful loading spinner
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 NEW FUNCTION: The actual API Bridge to your Python FastAPI server
  const handleWizardComplete = async (b: TripBrief) => {
    setBrief(b);
    setIsLoading(true);

    // Immediately move to the next stage so the user sees the dashboard loading state
    setStage("blueprint");

    console.log("🚀 Sending onboarding brief to Python FastAPI backend...", b);

    // Format the clean React data into strings your CrewAI agents expect
    const travelDates = `${b.startDate} to ${b.endDate}`;
    const budgetMix = `Custom Balance - Food: ${b.budget.food}%, Sights: ${b.budget.sights}%, Stay: ${b.budget.stay}%`;
    const richGroupDetails = `
      Group Composition: ${b.travelers}. 
      Dietary Requirements: ${b.diet.length > 0 ? b.diet.join(", ") : "None"}. 
      Inspiration / Links to look up: ${b.inspiration || "None provided"}.
    `;

    try {
      const response = await fetch("http://localhost:8000/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: b.destination,
          travel_dates: travelDates,
          budget: budgetMix,
          group_details: richGroupDetails,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🎉 SUCCESS! Received AI Itinerary from Python:", data.itinerary);

        setItinerary(data.itinerary); // Save the raw text to pass to your dashboard later!
      } else {
        console.error("The FastAPI brain rejected the request or threw an internal error.");
      }
    } catch (error) {
      console.error("Failed to connect to Python backend. Is your terminal running 'python api.py'?", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Compass className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">TripMind-AI</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <span className={stage === "wizard" ? "text-foreground" : ""}>Plan</span>
            <span className={stage === "blueprint" ? "text-foreground" : ""}>Blueprint</span>
            <span className={stage === "dashboard" ? "text-foreground" : ""}>Itinerary</span>
          </nav>
        </div>
      </header>

      {/* RENDER LOGIC BASED ON STAGE */}
      {stage === "wizard" && (
        <OnboardingWizard onComplete={handleWizardComplete} />
      )}

      {stage === "blueprint" && (
        <div className="mx-auto max-w-7xl px-6 py-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground animate-pulse">
                🤖 The Profiler and Logistics Managers are building your blueprint...
              </p>
            </div>
          ) : (
            <Blueprint
              brief={brief!}
              itinerary={itinerary}
              onBack={() => setStage("wizard")}
              onConfirm={() => setStage("dashboard")}
            />
          )}
        </div>
      )}
      {stage === "dashboard" && (
        <Dashboard brief={brief} itinerary={itinerary} />
      )}
    </div>
  );
}

