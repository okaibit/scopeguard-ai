"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type AnalysisResult = {
  decision: "In Scope" | "Out of Scope";
  confidence: number;
  summary: string;
  detectedChanges: string[];
  estimatedHours: number;
  hourlyRate: number;
  overage: number;
};

export default function PRIntakePage() {
  const [prTitle, setPrTitle] = useState("Add PDF Export");

  const [prChanges, setPrChanges] = useState(
    "Added PDF export functionality and supporting export controls."
  );

  const [sow, setSow] = useState(
    "Build 3 React components: UserProfile, Dashboard and Settings."
  );

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-scope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sow,
          prTitle,
          prChanges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scope analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the PR."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            ← ScopeGuard
          </Link>

          <div className="mt-6">
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400">
              PR INTAKE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Analyze a GitHub Pull Request
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Give ScopeGuard the pull request details and the agreed
              statement of work. The AI will determine whether the
              requested changes fall inside or outside the original
              scope.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Scope Analysis
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Project information
              </h2>
            </div>

            <form
              onSubmit={handleAnalyze}
              className="space-y-6"
            >
              {/* PR Title */}
              <div>
                <label
                  htmlFor="prTitle"
                  className="text-sm font-medium text-slate-300"
                >
                  Pull Request Title
                </label>

                <input
                  id="prTitle"
                  type="text"
                  value={prTitle}
                  onChange={(event) =>
                    setPrTitle(event.target.value)
                  }
                  placeholder="Add PDF Export"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  required
                />
              </div>

              {/* PR Changes */}
              <div>
                <label
                  htmlFor="prChanges"
                  className="text-sm font-medium text-slate-300"
                >
                  Pull Request Changes
                </label>

                <textarea
                  id="prChanges"
                  value={prChanges}
                  onChange={(event) =>
                    setPrChanges(event.target.value)
                  }
                  rows={6}
                  placeholder="Describe the changes introduced by the pull request..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  required
                />

                <p className="mt-2 text-xs text-slate-600">
                  Describe the new functionality, files, features, or
                  changes introduced by the PR.
                </p>
              </div>

              {/* SOW */}
              <div>
                <label
                  htmlFor="sow"
                  className="text-sm font-medium text-slate-300"
                >
                  Original Statement of Work
                </label>

                <textarea
                  id="sow"
                  value={sow}
                  onChange={(event) =>
                    setSow(event.target.value)
                  }
                  rows={7}
                  placeholder="Describe what the freelancer agreed to build..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  required
                />

                <p className="mt-2 text-xs text-slate-600">
                  ScopeGuard uses this agreement as the baseline for
                  determining whether new work is additional scope.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Analyze */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing
                  ? "ScopeGuard AI is analyzing..."
                  : "Analyze Pull Request"}
              </button>
            </form>
          </section>

          {/* How it works */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              How it works
            </p>

            <div className="mt-5 space-y-5">
              <Step
                number="01"
                title="Read"
                description="Read the PR title and the changes submitted by the freelancer."
              />

              <Step
                number="02"
                title="Compare"
                description="Compare the requested changes against the original SOW."
              />

              <Step
                number="03"
                title="Reason"
                description="Determine whether the change is inside or outside the agreed scope."
              />

              <Step
                number="04"
                title="Calculate"
                description="Estimate the additional work and potential overage."
              />
            </div>
          </aside>
        </div>

        {/* Result */}
        {result && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  ScopeGuard Decision
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {result.decision}
                </h2>
              </div>

              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  result.decision === "Out of Scope"
                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {result.confidence}% confidence
              </div>
            </div>

            {/* AI Summary */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                AI Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {result.summary}
              </p>
            </div>

            {/* Detected Changes */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Detected Changes
              </p>

              <div className="mt-3 space-y-2">
                {result.detectedChanges.map(
                  (change, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <span className="text-cyan-400">
                        +
                      </span>

                      <p className="text-sm text-slate-300">
                        {change}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <ResultMetric
                label="Estimated Work"
                value={`${result.estimatedHours} hours`}
              />

              <ResultMetric
                label="Hourly Rate"
                value={`$${result.hourlyRate}`}
              />

              <ResultMetric
                label="Potential Overage"
                value={`$${result.overage} USDC`}
                highlight
              />
            </div>

            {/* Continue */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Analysis complete. Continue to the audit dashboard
                to review the decision and settlement.
              </p>

              <Link
                href="/audit-dashboard"
                className="rounded-xl bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Open Audit Dashboard →
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-cyan-400">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          highlight ? "text-cyan-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
