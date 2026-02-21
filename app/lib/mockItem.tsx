import type { Insight } from "../components/InsightRow";
import {
  AgeIcon,
  MaterialsIcon,
  ConditionIcon,
  RestorationIcon,
} from "../components/InsightIcons";

type MockItem = {
  title: string;
  notes: string;
  askingPrice: number;
  fairValueRange: [number, number];
  estSavingsRange: [number, number];
  recommendation: {
    headline: string;
    subhead: string;
    confidence: "High" | "Medium" | "Low";
    chips: string[];
  };
  insights: Insight[];
  hotspots: { id: string; top: string; left: string }[];
};

export const mockDresser: MockItem = {
  title: "Late Victorian Dresser",
  notes: "Notes shown here",
  askingPrice: 150,
  fairValueRange: [250, 550],
  estSavingsRange: [100, 400],
  recommendation: {
    headline: "Purchase this!",
    subhead: "Solid wood, fair price, light restoration.",
    confidence: "High",
    chips: ["Save $100-400", "Excellent condition", "Minimal restoration"],
  },
  insights: [
    {
      label: "Age",
      value: "1890s - 1920s",
      confidence: "Medium",
      note: "Based on joinery and drawer pulls.",
      icon: <AgeIcon />,
    },
    {
      label: "Materials",
      value: "Solid oak hardwood",
      confidence: "High",
      note: "Visible grain and weight cues.",
      icon: <MaterialsIcon />,
    },
    {
      label: "Condition",
      value: "Excellent",
      confidence: "High",
      note: "Minor surface scratches only.",
      icon: <ConditionIcon />,
    },
    {
      label: "Restoration effort",
      value: "Minimal - ~1 hour",
      confidence: "Medium",
      note: "Light sanding + oiling.",
      icon: <RestorationIcon />,
    },
  ],
  hotspots: [
    { id: "h1", top: "22%", left: "16%" },
    { id: "h2", top: "32%", left: "68%" },
    { id: "h3", top: "62%", left: "26%" },
  ],
};

export const mockChair: MockItem = {
  title: "Mid-Century Wooden Chair",
  notes: "Estate sale find",
  askingPrice: 45,
  fairValueRange: [80, 180],
  estSavingsRange: [35, 135],
  recommendation: {
    headline: "Worth a closer look",
    subhead: "Solid wood, fair for the style. Check joints before buying.",
    confidence: "Medium",
    chips: ["Save $35-135", "Good condition", "Light cleanup"],
  },
  insights: [
    {
      label: "Age",
      value: "1960s - 1970s",
      confidence: "Medium",
      note: "Tapered legs and simple lines.",
      icon: <AgeIcon />,
    },
    {
      label: "Materials",
      value: "Likely teak or walnut",
      confidence: "Medium",
      note: "Grain suggests hardwood.",
      icon: <MaterialsIcon />,
    },
    {
      label: "Condition",
      value: "Good",
      confidence: "High",
      note: "Some wear on seat; no major damage.",
      icon: <ConditionIcon />,
    },
    {
      label: "Restoration effort",
      value: "Light - ~2 hours",
      confidence: "Medium",
      note: "Clean, light sand, oil.",
      icon: <RestorationIcon />,
    },
  ],
  hotspots: [
    { id: "h1", top: "28%", left: "50%" },
    { id: "h2", top: "55%", left: "30%" },
    { id: "h3", top: "55%", left: "70%" },
  ],
};

export const mockNightstand: MockItem = {
  title: "Solid Wood Nightstand",
  notes: "Facebook Marketplace",
  askingPrice: 75,
  fairValueRange: [120, 220],
  estSavingsRange: [45, 145],
  recommendation: {
    headline: "Purchase this!",
    subhead: "Solid construction, fair price. Minor touch-ups only.",
    confidence: "High",
    chips: ["Save $45-145", "Very good condition", "Minimal restoration"],
  },
  insights: [
    {
      label: "Age",
      value: "1980s - 1990s",
      confidence: "Medium",
      note: "Construction and hardware style.",
      icon: <AgeIcon />,
    },
    {
      label: "Materials",
      value: "Solid wood, likely oak",
      confidence: "High",
      note: "Visible grain; substantial weight.",
      icon: <MaterialsIcon />,
    },
    {
      label: "Condition",
      value: "Very good",
      confidence: "High",
      note: "Small nicks; drawers run smoothly.",
      icon: <ConditionIcon />,
    },
    {
      label: "Restoration effort",
      value: "Minimal - ~30 min",
      confidence: "High",
      note: "Wipe down, light oil if desired.",
      icon: <RestorationIcon />,
    },
  ],
  hotspots: [
    { id: "h1", top: "20%", left: "20%" },
    { id: "h2", top: "50%", left: "50%" },
    { id: "h3", top: "75%", left: "75%" },
  ],
};

export const mockExamples = {
  dresser: mockDresser,
  chair: mockChair,
  nightstand: mockNightstand,
} as const;

export type ExampleId = keyof typeof mockExamples;

export function getMockItem(exampleId: string | null | undefined): MockItem {
  if (exampleId && exampleId in mockExamples) {
    return mockExamples[exampleId as ExampleId];
  }
  return mockDresser;
}

/** @deprecated Use getMockItem or mockDresser. Kept for backwards compatibility. */
export const mockItem = mockDresser;
