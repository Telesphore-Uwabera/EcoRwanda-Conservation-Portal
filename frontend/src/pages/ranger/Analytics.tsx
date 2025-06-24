import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PatrolAnalytics } from "@/components/patrol/PatrolAnalytics";

export default function RangerAnalytics() {
  return (
      <div className="space-y-6 p-4 md:p-8">
        <PatrolAnalytics />
      </div>
  );
}