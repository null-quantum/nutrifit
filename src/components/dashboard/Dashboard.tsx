"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "./DashboardLayout";
import OverviewTab from "./OverviewTab";
import AnalyticsTab from "./AnalyticsTab";
import NutritionTab from "./NutritionTab";
import FitnessTab from "./FitnessTab";
import WellnessStoreTab from "./WellnessStoreTab";
import TracksTab from "./TracksTab";
import UserSettingsTab from "./UserSettingsTab";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "nutrition":
        return <NutritionTab />;
      case "fitness":
        return <FitnessTab user={user} />;
      case "store":
        return <WellnessStoreTab />;
      case "tracks":
        return <TracksTab />;
      case "settings":
        return <UserSettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTab()}
    </DashboardLayout>
  );
}
