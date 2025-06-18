import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-4">Research Analytics</h1>
        <p className="text-gray-600">Analytics and insights about your research projects will appear here.</p>
        {/* Add charts, stats, or tables here */}
      </div>
    </DashboardLayout>
  );
} 