import { LayoutDashboard, BarChart3, FileText, ShieldAlert, WalletCards, Settings } from "lucide-react";

export const appNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/claims", label: "Claims", icon: FileText },
  { href: "/security", label: "Security", icon: ShieldAlert },
  { href: "/payments", label: "Payments", icon: WalletCards },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

export const chromeRoutes = appNavItems.map((item) => item.href);
