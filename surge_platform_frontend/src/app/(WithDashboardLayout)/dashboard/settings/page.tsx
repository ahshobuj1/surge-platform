"use client";

import { useState } from "react";
import { SettingsTab, SettingsTabBar } from "../SettingsTabBar";
import { SettingsPublishing } from "../SettingsPublishing";
import { SettingsSchedule } from "../SettingsSchedule";
import { SettingsBilling } from "../SettingsBilling";
import ProfileSettings from "../SettingsRSSFeeds";


function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 overflow-auto bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold text-foreground tracking-tight">
        Settings
      </h1>

      <SettingsTabBar activeTab={activeTab} onChange={setActiveTab} />

      <div className="max-w-full w-full">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "integration" && <SettingsPublishing />}
        {activeTab === "schedule" && <SettingsSchedule />}
        {activeTab === "billing" && <SettingsBilling />}
      </div>
    </div>
  );
}

export default SettingsPage;