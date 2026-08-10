"use client";

import { useState } from "react";

type Analysis = {
  decision: string;
  scopeStatus: string;
  confidence: number;
  detectedChanges: string[];
  newScopeItems: string[];
  existingScopeItems: string[];
  estimatedHours: number;
  hourlyRate: number;
  settlement: number;
  currency: string;
  reasoning: string;
  recommendation: string;
};

export default function ScopeAnalyzerPage() {
  const [sow, setSow] = useState(
    "Build 3 React components: UserProfile, Dashboard and Settings."
  );

  const [prTitle, setPrTitle] = useState(
    "Add PDF Export"
  );

  const [prChanges, setPrChanges] = useState(
    "Added PDF export functionality and supporting export controls."
  );

  const [hourlyRate, setHourlyRate] = useState("50");

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeScope = async () => {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(
        "/api/analyze-scope",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sow,
            prTitle,
            prChanges,
            hourlyRate: Number(hourlyRate),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Analysis failed"
        );
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 text-sm font-semibold tracking-[0.2em] text-cyan-400">
            SCOPEGUARD AI
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Scope Analyzer
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Compare a software change against the original
            statement of work and determine whether additional
            compensation is required.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Input */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Analysis Input
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Project Scope
              </h2>
            </div>

            {/* SOW */}
            <label className="block">
              <span className="text-sm font-medium text-slate-300">
                Original SOW
              </span>

              <textarea
                value={sow}
                onChange={(e) =>
                  setSow(e.target.value)
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400"
              />
            </label>

            {/* PR Title */}
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-300">
                Pull Request
              </span>

              <input
                value={prTitle}
                onChange={(e) =>
                  setPrTitle(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400"
              />
            </label>

            {/* PR Changes */}
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-300">
                Detected Changes
              </span>

              <textarea
                value={prChanges}
                onChange={(e) =>
                  setPrChanges(e.target.value)
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400"
              />
            </label>

            {/* Rate */}
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-300">
                Hourly Rate
              </span>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>

                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 pl-8 text-sm text-slate-200 outline-none transition focus:border-cyan-400"
                />
              </div>
            </label>

            <button
              onClick={analyzeScope}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing Scope..."
                : "Analyze Scope"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                {error}
              </div>
            )}
          </section>

          {/* Results */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {!analysis && !loading && (
              <div className="flex min-h-[500px] items-center justify-center text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                    AI
                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    Awaiting analysis
                  </h2>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Submit the SOW and PR changes to generate
                    a ScopeGuard decision.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[500px] items-center justify-center text-center">
                <div>
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                  <h2 className="mt-5 text-xl font-semibold">
                    AI is analyzing...
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Comparing the requested changes against the
                    agreed scope.
                  </p>
                </div>
              </div>
            )}

            {analysis && (
              <div>

                {/* Decision */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      AI Decision
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {analysis.decision}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      analysis.scopeStatus ===
                      "out_of_scope"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {analysis.scopeStatus ===
                    "out_of_scope"
                      ? "OUT OF SCOPE"
                      : "WITHIN SCOPE"}
                  </span>
                </div>

                {/* Confidence */}
                <div className="mt-6 rounded-xl bg-slate-950 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">
                      AI confidence
                    </span>

                    <span className="font-semibold text-cyan-400">
                      {analysis.confidence}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${analysis.confidence}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Findings */}
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Detected Changes
                  </p>

                  <div className="mt-3 space-y-2">
                    {analysis.detectedChanges.map(
                      (change) => (
                        <div
                          key={change}
                          className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
                        >
                          {change}
                        </div>
                      )
                    )}

                    {analysis.detectedChanges.length ===
                      0 && (
                      <p className="text-sm text-slate-500">
                        No recognized scope changes detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    AI Reasoning
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {analysis.reasoning}
                  </p>
                </div>

                {/* Settlement */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">

                  <ResultMetric
                    label="Estimated work"
                    value={`${analysis.estimatedHours} hrs`}
                  />

                  <ResultMetric
                    label="Hourly rate"
                    value={`$${analysis.hourlyRate}`}
                  />

                  <ResultMetric
                    label="Settlement"
                    value={`${analysis.settlement} ${analysis.currency}`}
                  />

                </div>

                {/* Recommendation */}
                <div className="mt-5 rounded-xl bg-slate-950 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recommendation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {analysis.recommendation}
                  </p>
                </div>

              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ResultMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
