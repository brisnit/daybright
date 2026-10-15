import type { Metadata } from "next";
import { DashboardOverview } from "@/components/workspace/dashboard-overview";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return <DashboardOverview />;
}
