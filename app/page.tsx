"use client";
import { useState } from "react";
type AnalysisState =
  | "idle"
  | "analyzing"
  | "complete"
  | "executing"
  | "success"
  | "error";
const analysisSteps = [
  "Reading GitHub Pull Request...",
  "Comparing changes against the SOW...",
  "Identifying scope deviations...",
  "Estimating additional work...",
  "Generating settlement recommendation...",
];
export default function Home() {
  const [analysisState, setAnalysisState] =
    useState<AnalysisState>("idle");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [status, setStatus] = useState("Awaiting AI analysis");
  const [executionMessage, setExecutionMessage] = useState("");
  const runAnalysis = async () => {
    setAnalysisState("analyzing");
    setAnalysisStep(0);
    setStatus(analysisSteps[0]);
    for (let i = 1; i < analysisSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAnalysisStep(i);
      setStatus(analysisSteps[i]);
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
    setAnalysisState("complete");
    setStatus("AI analysis complete");
  };
  const handleExecute = async () => {
    setAnalysisState("executing");
    setExecutionMessage("");
    setStatus("Connecting to KeeperHub...");
    try {
      const response = await fetch("/api/keeperhub/execute", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "KeeperHub execution failed"
        );
      }
      setAnalysisState("success");
      setStatus("KeeperHub execution request received");
      setExecutionMessage(
        "Settlement request has been handed to the execution layer."
      );
    } catch (error) {
      setAnalysisState("error");
      const message =
        error instanceof Error
          ? error.message
          : "Execution failed";
      setStatus(message);
      setExecutionMessage(
        "Execution did not complete. The settlement remains pending."
      );
    }
  };
  const isAnalyzing = analysisState === "analyzing";
  const isExecuting = analysisState === "executing";
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <span className="text-sm font-semibold tracking-[0.2em] text-cyan-400">
              SCOPEGUARD AI
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Autonomous Scope Protection
          </h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            ScopeGuard analyzes software changes against an agreed
            statement of work, detects out-of-scope work, calculates
            the overage, and prepares an onchain settlement.
          </p>
        </header>
        {/* AI Control Bar */}
        <section className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                AI Scope Analysis
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Compare the pull request against the original agreement.
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || isExecuting}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing
                ? "AI Analyzing..."
                : "Run AI Analysis"}
            </button>
          </div>
          {/* Analysis progress */}
          {isAnalyzing && (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {status}
                </span>
                <span className="text-xs text-slate-500">
                  {analysisStep + 1}/{analysisSteps.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{
                    width: `${
                      ((analysisStep + 1) /
                        analysisSteps.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
          {analysisState === "complete" && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                ✓
              </div>
              <div>
                <p className="font-semibold text-emerald-400">
                  AI analysis complete
                </p>
                <p className="text-sm text-slate-400">
                  Scope deviation detected and settlement calculated.
                </p>
              </div>
            </div>
          )}
        </section>
        {/* Main Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* PR Analysis */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  GitHub Pull Request
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  PR #42 — Add PDF Export
                </h2>
              </div>
              <span className="w-fit rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
                Out of scope
              </span>
            </div>
            <div className="space-y-4">
              {/* Original SOW */}
              <div className="rounded-xl bg-slate-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Original SOW
                </p>
                <p className="mt-2 text-slate-300">
                  Build 3 React components:
                  <span className="font-medium text-white">
                    {" "}
                    UserProfile, Dashboard and Settings.
                  </span>
                </p>
              </div>
              {/* Detected Change */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                    Detected Change
                  </p>
                  <span className="text-xs text-red-400">
                    + Out of scope
                  </span>
                </div>
                <p className="mt-2 text-slate-200">
                  Added PDF export functionality and supporting
                  export controls.
                </p>
              </div>
              {/* AI Findings */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                    AI Findings
                  </p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                    87% confidence
                  </span>
                </div>
                <div className="space-y-3">
                  <Finding
                    title="New functionality detected"
                    description="PDF generation was not included in the original component scope."
                  />
                  <Finding
                    title="Supporting controls detected"
                    description="Export buttons and related UI introduce additional implementation work."
                  />
                  <Finding
                    title="Settlement recommended"
                    description="The detected work represents an estimated 3 additional engineering hours."
                  />
                </div>
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                AI Decision
              </p>
              <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-400">
                AI
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold">
              Settlement required
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              ScopeGuard determined that the PDF export feature
              was not included in the original agreement.
            </p>
            {/* Scope Score */}
            <div className="my-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Out-of-scope score
                </span>
                <span className="text-lg font-bold text-red-400">
                  87%
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{ width: "87%" }}
                />
              </div>
            </div>
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
              <div className="mt-4 flex justify-between gap-4">
                <span className="text-slate-400">
                  Settlement
                </span>
                <span className="font-semibold text-cyan-400">
                  150 USDC
                </span>
              </div>
            </div>
            {/* Execute */}
            <button
              onClick={handleExecute}
              disabled={
                isExecuting ||
                isAnalyzing ||
                analysisState !== "complete"
              }
              className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isExecuting
                ? "Executing..."
                : analysisState === "complete"
                ? "Approve & Execute"
                : "Run AI Analysis First"}
            </button>
            {/* Status */}
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 px-3 py-3">
              <p className="text-center text-xs text-slate-500">
                {status}
              </p>
            </div>
            {executionMessage && (
              <div
                className={`mt-3 rounded-lg border px-3 py-3 ${
                  analysisState === "success"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}
              >
                <p className="text-center text-xs">
                  {executionMessage}
                </p>
              </div>
            )}
          </div>
        </section>
        {/* Execution Pipeline */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
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
              active={analysisState === "executing" || analysisState === "success"}
            />
            <PipelineStep
              number="04"
              title="Verify"
              description="Record the transaction proof and audit trail."
              active={analysisState === "success"}
            />
          </div>
        </section>
        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-600">
          ScopeGuard AI · Autonomous scope enforcement for software work
        </footer>
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
function Finding({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs text-cyan-400">
        ✓
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
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
