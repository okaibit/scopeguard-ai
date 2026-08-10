"use client";

import { useState } from "react";

type AuditStatus =
  | "Detected"
  | "Analyzing"
  | "Out of Scope"
  | "Approved"
  | "Settled";

type Audit = {
  id: string;
  pr: string;
  title: string;
  developer: string;
  status: AuditStatus;
  change: string;
  estimate: string;
  overage: string;
};

const initialAudits: Audit[] = [
  {
    id: "SG-042",
    pr: "#42",
    title: "Add PDF Export",
    developer: "0x71...9A42",
    status: "Out of Scope",
    change: "PDF export functionality and supporting export controls.",
    estimate: "3 hours",
    overage: "$150 USDC",
  },
  {
    id: "SG-041",
    pr: "#41",
    title: "Update Dashboard UI",
    developer: "0x84...21BF",
    status: "Approved",
    change: "Dashboard layout and responsive styling improvements.",
    estimate: "2 hours",
    overage: "$100 USDC",
  },
  {
    id: "SG-040",
    pr: "#40",
    title: "Fix Authentication Bug",
    developer: "0x52...77AC",
    status: "Settled",
    change: "Fixed authentication redirect handling.",
    estimate: "1 hour",
    overage: "$50 USDC",
  },
];

export default function AuditDashboard() {
  const [audits, setAudits] = useState(initialAudits);
  const [selectedAudit, setSelectedAudit] = useState(initialAudits[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState(
    "Waiting for a scope analysis event."
  );

  const runAnalysis = () => {
    setIsRunning(true);
    setMessage("ScopeGuard AI is analyzing the pull request...");

    setTimeout(() => {
      setAudits((current) =>
        current.map((audit) =>
          audit.id === selectedAudit.id
            ? {
                ...audit,
                status: "Out of Scope",
              }
            : audit
        )
      );

      setSelectedAudit((current) => ({
        ...current,
        status: "Out of Scope",
      }));

      setMessage(
        "Analysis complete. ScopeGuard detected work outside the agreed SOW."
      );

      setIsRunning(false);
    }, 1600);
  };

  const approveSettlement = () => {
    setAudits((current) =>
      current.map((audit) =>
        audit.id === selectedAudit.id
          ? {
              ...audit,
              status: "Approved",
            }
          : audit
      )
    );

    setSelectedAudit((current) => ({
      ...current,
      status: "Approved",
    }));

    setMessage(
      "Settlement approved. Ready for KeeperHub execution."
    );
  };

  const simulateSettlement = () => {
    setMessage("Sending settlement through execution pipeline...");

    setTimeout(() => {
      setAudits((current) =>
        current.map((audit) =>
          audit.id === selectedAudit.id
            ? {
                ...audit,
                status: "Settled",
              }
            : audit
        )
      );

      setSelectedAudit((current) => ({
        ...current,
        status: "Settled",
      }));

      setMessage(
        "Settlement recorded. Transaction proof is ready for verification."
      );
    }, 1400);
  };

  const totalOverage = audits.reduce((total, audit) => {
    const amount = Number(
      audit.overage.replace(/[^0-9.]/g, "")
    );

    return total + amount;
  }, 0);

  const openAudits = audits.filter(
    (audit) =>
      audit.status === "Detected" ||
      audit.status === "Analyzing" ||
      audit.status === "Out of Scope"
  ).length;

  const settledAudits = audits.filter(
    (audit) => audit.status === "Settled"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400">
                SCOPEGUARD AI
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Audit Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Monitor AI scope decisions, overage settlements,
                execution status, and on-chain verification.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-xs text-slate-500">
                System status
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                AI monitoring active
              </p>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Audits"
            value={String(audits.length)}
            detail="Total analyzed"
          />

          <Metric
            label="Open Audits"
            value={String(openAudits)}
            detail="Require attention"
          />

          <Metric
            label="Potential Overage"
            value={`$${totalOverage}`}
            detail="USDC"
          />

          <Metric
            label="Settled"
            value={String(settledAudits)}
            detail="Completed"
          />
        </section>

        {/* Main */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Audit list */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Audit Queue
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Recent scope events
              </h2>
            </div>

            <div className="space-y-3">
              {audits.map((audit) => {
                const selected = audit.id === selectedAudit.id;

                return (
                  <button
                    key={audit.id}
                    onClick={() => {
                      setSelectedAudit(audit);
                      setMessage(
                        "Audit selected. Ready for analysis."
                      );
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-cyan-400/40 bg-cyan-400/5"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500">
                        {audit.id}
                      </span>

                      <StatusBadge status={audit.status} />
                    </div>

                    <h3 className="mt-3 font-semibold">
                      {audit.pr} — {audit.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {audit.developer}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit detail */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {selectedAudit.id} · GitHub Pull Request
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedAudit.pr} — {selectedAudit.title}
                </h2>
              </div>

              <StatusBadge status={selectedAudit.status} />
            </div>

            {/* Scope comparison */}
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Original SOW"
                text="Build 3 React components: UserProfile, Dashboard and Settings."
              />

              <InfoCard
                label="Detected Change"
                text={selectedAudit.change}
                danger
              />
            </div>

            {/* AI reasoning */}
            <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <p className="text-xs uppercase tracking-wider text-cyan-400">
                AI Reasoning
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                ScopeGuard compared the requested work against the
                original statement of work and identified the detected
                feature as additional functionality.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SmallStat
                  label="Estimated Work"
                  value={selectedAudit.estimate}
                />

                <SmallStat
                  label="Hourly Rate"
                  value="$50"
                />

                <SmallStat
                  label="Settlement"
                  value={selectedAudit.overage}
                />
              </div>
            </div>

            {/* Pipeline */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Execution Pipeline
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <Pipeline
                  number="01"
                  title="Detect"
                  complete
                />

                <Pipeline
                  number="02"
                  title="Reason"
                  complete
                />

                <Pipeline
                  number="03"
                  title="Execute"
                  complete={selectedAudit.status === "Settled"}
                  active={
                    selectedAudit.status === "Approved"
                  }
                />

                <Pipeline
                  number="04"
                  title="Verify"
                  complete={selectedAudit.status === "Settled"}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={runAnalysis}
                disabled={isRunning}
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
              >
                {isRunning
                  ? "AI Analyzing..."
                  : "Run AI Analysis"}
              </button>

              <button
                onClick={approveSettlement}
                disabled={
                  selectedAudit.status !== "Out of Scope"
                }
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Approve Settlement
              </button>

              <button
                onClick={simulateSettlement}
                disabled={
                  selectedAudit.status !== "Approved"
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Simulate KeeperHub
              </button>
            </div>

            {/* System message */}
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                System Event
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {message}
              </p>
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                On-chain verification
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Settlement proof
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Once KeeperHub executes the approved settlement,
                ScopeGuard records the transaction hash and links it
                to the original GitHub audit.
              </p>
            </div>

            <div
              className={`rounded-xl border px-5 py-4 ${
                selectedAudit.status === "Settled"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-800 bg-slate-950"
              }`}
            >
              <p className="text-xs text-slate-500">
                Transaction status
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  selectedAudit.status === "Settled"
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {selectedAudit.status === "Settled"
                  ? "Verified onchain"
                  : "Awaiting execution"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {detail}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AuditStatus;
}) {
  const styles: Record<AuditStatus, string> = {
    Detected:
      "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    Analyzing:
      "bg-blue-400/10 text-blue-400 border-blue-400/20",
    "Out of Scope":
      "bg-red-400/10 text-red-400 border-red-400/20",
    Approved:
      "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    Settled:
      "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  label,
  text,
  danger = false,
}: {
  label: string;
  text: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-red-500/20 bg-red-500/5"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-wider ${
          danger ? "text-red-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        {text}
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function Pipeline({
  number,
  title,
  active = false,
  complete = false,
}: {
  number: string;
  title: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        complete
          ? "border-emerald-500/20 bg-emerald-500/5"
          : active
          ? "border-cyan-400/30 bg-cyan-400/5"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          {number}
        </span>

        {complete && (
          <span className="text-xs text-emerald-400">
            ✓
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>
    </div>
  );
}
