"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ActualProduction from "@/components/actual-production"
import ActualGranding from "@/components/actual-granding"
import History from "@/components/history"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"production" | "granding" | "history">("production")

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "production" && <ActualProduction />}
        {activeTab === "granding" && <ActualGranding />}
        {activeTab === "history" && <History />}
      </div>
    </div>
  )
}
