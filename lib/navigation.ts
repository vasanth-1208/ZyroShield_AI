import {
  LayoutDashboard,
  Shield,
  BarChart3,
  FileText,
  ShieldAlert,
  WalletCards,
  Settings,
  ScrollText,
  BrainCircuit,
  MapPinned,
  Calculator,
  Bell,
  Activity
} from "lucide-react";

export const appNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/policy", label: "Policy", icon: Shield },
  { href: "/policy-terms", label: "Policy Terms", icon: ScrollText },
  { href: "/ai-insights", label: "AI Insights", icon: BrainCircuit },
  { href: "/risk-zones", label: "Risk Zones", icon: MapPinned },
  { href: "/income-risk-calculator", label: "Income Calculator", icon: Calculator },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/admin-risk-monitor", label: "Admin Monitor", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/claims", label: "Claims", icon: FileText },
  { href: "/security", label: "Security", icon: ShieldAlert },
  { href: "/payments", label: "Payments", icon: WalletCards },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

export const chromeRoutes = appNavItems.map((item) => item.href);
