"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Awaiting approval");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    setStatus("Connecting to KeeperHub...");

    try {
      const response = await fetch("/api/keeperhub/execute", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution failed");
      }

      setStatus("KeeperHub execution request received");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Execution failed"
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 text-sm font-medium tracking-wider text-cyan-400">
            SCOPEGUARD AI
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Autonomous Scope Protection
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            AI detects work outside the agreed scope and prepares an
            onchain overage settlement.
          </p>
        </header>

        {/* Main Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* PR Analysis */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  GitHub Pull Request
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  PR #42 — Add PDF Export
                </h2>
              </div>

              <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
                Out of scope
              </span>
            </div>

            <div className="space-y-4">
              {/* Original SOW */}
              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Original SOW
                </p>

                <p className="mt-2 text-slate-300">
                  Build 3 React components: UserProfile, Dashboard and
                  Settings.
                </p>
              </div>

              {/* Detected Change */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs uppercase tracking-wide text-red-400">
                  Detected change
                </p>

                <p className="mt-2 text-slate-200">
                  Added PDF export functionality and supporting export
                  controls.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric
                  label="Estimated work"
                  value="3 hours"
                />

                <Metric
                  label="Hourly rate"
                  value="$50"
                />

                <Metric
                  label="Overage"
                  value="$150 USDC"
                />
              </div>
            </div>
          </div>

          {/* AI Decision */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              AI Decision
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Settlement required
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              ScopeGuard determined that the PDF export feature was
              not included in the original agreement.
            </p>

            {/* Settlement Details */}
            <div className="my-6 rounded-xl bg-slate-950 p-4">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">
                  Freelancer
                </span>

                <span className="font-medium">
                  0x71...9A42
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-slate-400">
                  Settlement
                </span>

                <span className="font-semibold text-cyan-400">
                  150 USDC
                </span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExecuting
                ? "Connecting..."
                : "Approve & Execute"}
            </button>

            {/* Status */}
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
              <p className="text-center text-xs text-slate-500">
                {status}
              </p>
            </div>
          </div>
        </section>

        {/* Execution Pipeline */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Execution Pipeline
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              ScopeGuard → KeeperHub → Onchain
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <PipelineStep
              number="01"
              title="Detect"
              description="Analyze PR changes against the SOW."
              active
            />

            <PipelineStep
              number="02"
              title="Reason"
              description="Determine whether the change is out of scope."
              active
            />

            <PipelineStep
              number="03"
              title="Execute"
              description="Send the approved settlement to KeeperHub."
            />

            <PipelineStep
              number="04"
              title="Verify"
              description="Record the transaction proof and audit trail."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-cyan-400 text-slate-950"
            : "bg-slate-800 text-slate-400"
        }`}
      >
        {number}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}
