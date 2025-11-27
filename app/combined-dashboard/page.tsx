// app/combined-dashboard/page.tsx
import React from "react";
import TeslaDashboard from "../dashboard/page";
import SungrowDashboard from "../sungrow/dashboard/page";

export default function CombinedDashboardPage() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Combined Energy Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Tesla and Sungrow data side by side, using your existing integrations.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tesla</h2>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                /dashboard
              </span>
            </div>
            <div className="h-px bg-slate-800" />
            <TeslaDashboard />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sungrow</h2>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                /sungrow/dashboard
              </span>
            </div>
            <div className="h-px bg-slate-800" />
            <SungrowDashboard />
          </div>
        </section>
      </div>
    </main>
  );
}
