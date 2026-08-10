"use client";
import { useEffect, useState } from "react";
const STORAGE_KEY = "scopeguard-current-audit";
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
  hourlyRate: number;
};
const initialAudits: Audit[] = [
  {
    id: "SG-042",
    pr: "#42",
    title: "Add PDF Export",
    developer: "0x71...9A42",
    status: "Out of Scope",
    change:
      "PDF export functionality and supporting export controls.",
    estimate: "3 hours",
    overage: "$3 USDC",
    hourlyRate: 1,
  },
  {
    id: "SG-041",
    pr: "#41",
    title: "Update Dashboard UI",
    developer: "0x84...21BF",
    status: "Approved",
    change:
      "Dashboard layout and responsive styling improvements.",
    estimate: "2 hours",
    overage: "$3 USDC",
    hourlyRate: 1,
  },
  {
    id: "SG-040",
    pr: "#40",
    title: "Fix Authentication Bug",
    developer: "0x52...77AC",
    status: "Settled",
    change:
      "Fixed authentication redirect handling.",
    estimate: "1 hour",
    overage: "$3 USDC",
    hourlyRate: 1,
  },
];
const TEST_SETTLEMENT_AMOUNT = "3";
const TEST_RECIPIENT =
  "0x0D392ba82e6c86192cB92fd568BDCf33e9d2295E";
const BASE_SEPOLIA_NETWORK = "84532";
const BASE_SEPOLIA_EXPLORER =
  "https://sepolia.basescan.org/tx/";
export default function AuditDashboard() {
  const [audits, setAudits] = useState(initialAudits);
  const [selectedAudit, setSelectedAudit] = useState(
    initialAudits[0]
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState(
    "Waiting for a scope analysis event."
  );
  const [transactionHash, setTransactionHash] =
    useState("");
  const [transactionLink, setTransactionLink] =
    useState("");

  useEffect(() => {
    const storedAudit = window.localStorage.getItem(
      STORAGE_KEY
    );

    if (storedAudit) {
      try {
        const savedAudit = JSON.parse(storedAudit);

        const dashboardAudit = {
          id: savedAudit.id,
          pr: savedAudit.pr,
          title: savedAudit.title,
          developer: savedAudit.developer,
          status: savedAudit.status,
          change: savedAudit.change,
          estimate: savedAudit.estimate,
          overage: savedAudit.overage,
          hourlyRate: Number(savedAudit.hourlyRate ?? 1),
        };

        setAudits((current) => {
          const existing = current.some(
            (audit) => audit.id === dashboardAudit.id
          );

          return existing
            ? current.map((audit) =>
                audit.id === dashboardAudit.id
                  ? { ...audit, ...dashboardAudit }
                  : audit
              )
            : [dashboardAudit, ...current];
        });

        setSelectedAudit(dashboardAudit);
      } catch {
        window.localStorage.removeItem(
          STORAGE_KEY
        );
      }
    }

    const storedSettlement =
      window.localStorage.getItem(
        "scopeguard-settlement"
      );

    if (!storedSettlement) {
      return;
    }

    try {
      const settlement = JSON.parse(
        storedSettlement
      );

      if (settlement.status !== "Settled") {
        return;
      }

      setTransactionHash(
        settlement.transactionHash || ""
      );
      setTransactionLink(
        settlement.transactionLink || ""
      );

      setAudits((current) =>
        current.map((audit) =>
          audit.id === settlement.auditId
            ? { ...audit, status: "Settled" }
            : audit
        )
      );

      setSelectedAudit((current) =>
        current.id === settlement.auditId
          ? { ...current, status: "Settled" }
          : current
      );
    } catch {
      window.localStorage.removeItem(
        "scopeguard-settlement"
      );
    }
  }, []);

  const recommendedSettlement =
    selectedAudit.overage;
  const runAnalysis = () => {
    setIsRunning(true);
    setMessage(
      "ScopeGuard AI is analyzing the pull request..."
    );
    setTransactionHash("");
    setTransactionLink("");
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
    if (selectedAudit.status !== "Out of Scope") {
      return;
    }
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
    setTransactionHash("");
    setTransactionLink("");
    setMessage(
      "Settlement approved. Ready for KeeperHub execution."
    );
  };
  const executeKeeperHubSettlement = async () => {
    if (selectedAudit.status !== "Approved") {
      return;
    }
    setIsExecuting(true);
    setTransactionHash("");
    setTransactionLink("");
    setMessage(
      `Sending ${TEST_SETTLEMENT_AMOUNT} USDC demo settlement through KeeperHub...`
    );
    try {
      const response = await fetch(
        "/api/keeperhub/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: TEST_SETTLEMENT_AMOUNT,
            recipientAddress: TEST_RECIPIENT,
            network: BASE_SEPOLIA_NETWORK,
            execute: true,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.keeperHub?.error ||
            "KeeperHub settlement execution failed."
        );
      }
      const keeperHub = data.keeperHub;
      const executionStatus = String(
        keeperHub?.status || ""
      ).toLowerCase();
      const executionSucceeded =
        executionStatus === "completed" ||
        executionStatus === "success" ||
        data.onchainExecuted === true;
      if (!executionSucceeded) {
        throw new Error(
          keeperHub?.error ||
            "KeeperHub did not confirm a successful execution."
        );
      }
      const possibleHash =
        keeperHub?.transactionHash ||
        data.transactionHash ||
        keeperHub?.txHash ||
        keeperHub?.hash ||
        keeperHub?.transaction?.hash ||
        keeperHub?.transaction?.transactionHash;
      const possibleTransactionLink =
        keeperHub?.transactionLink ||
        data.transactionLink ||
        (possibleHash
          ? `${BASE_SEPOLIA_EXPLORER}${possibleHash}`
          : "");
      if (!possibleHash && !possibleTransactionLink) {
        throw new Error(
          "KeeperHub execution completed, but no transaction proof was returned."
        );
      }
      setTransactionHash(
        possibleHash ? String(possibleHash) : ""
      );
      setTransactionLink(
        possibleTransactionLink
          ? String(possibleTransactionLink)
          : ""
      );
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
        "Settlement confirmed on Base Sepolia. Transaction proof is ready for verification."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "KeeperHub settlement execution failed."
      );
    } finally {
      setIsExecuting(false);
    }
  };
  const totalOverage = audits.reduce(
    (total, audit) => {
      const amount = Number(
        audit.overage.replace(/[^0-9.]/g, "")
      );
      return total + amount;
    },
    0
  );
  const openAudits = audits.filter(
    (audit) =>
      audit.status === "Detected" ||
      audit.status === "Analyzing" ||
      audit.status === "Out of Scope"
  ).length;
  const settledAudits = audits.filter(
    (audit) => audit.status === "Settled"
  ).length;
  const isVerified =
    selectedAudit.status === "Settled" &&
    Boolean(transactionHash || transactionLink);
  const isApproved =
    selectedAudit.status === "Approved";
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400">
                SCOPEGUARD AI
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Audit Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">
                Monitor AI scope decisions, overage settlements,
                KeeperHub execution, and on-chain verification.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                System status
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                AI monitoring active
              </p>
            </div>
          </div>
        </header>
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
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400">
                Audit Queue
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Recent scope events
              </h2>
            </div>
            <div className="space-y-3">
              {audits.map((audit) => {
                const selected =
                  audit.id === selectedAudit.id;
                return (
                  <button
                    key={audit.id}
                    onClick={() => {
                      setSelectedAudit(audit);
                      setTransactionHash("");
                      setTransactionLink("");
                      setMessage(
                        "Audit selected. Ready for analysis."
                      );
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-cyan-400/40 bg-cyan-400/5"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 dark:text-slate-400">
                        {audit.id}
                      </span>
                      <StatusBadge status={audit.status} />
                    </div>
                    <h3 className="mt-3 font-semibold">
                      {audit.pr} — {audit.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                      {audit.developer}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 dark:text-slate-400">
                  {selectedAudit.id} · GitHub Pull Request
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {selectedAudit.pr} — {selectedAudit.title}
                </h2>
              </div>
              <StatusBadge
                status={selectedAudit.status}
              />
            </div>
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
            <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <p className="text-xs uppercase tracking-wider text-cyan-400">
                AI Reasoning
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                ScopeGuard compared the requested work against
                the original statement of work and identified
                the detected feature as additional functionality.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SmallStat
                  label="Estimated Work"
                  value={selectedAudit.estimate}
                />
                <SmallStat
                  label="Hourly Rate"
                  value={`$${selectedAudit.hourlyRate}`}
                />
                <SmallStat
                  label="AI Recommended Overage"
                  value={recommendedSettlement}
                />
              </div>
            </div>
            {/* Settlement summary */}
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400">
                    Settlement
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {recommendedSettlement} recommended
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-400">
                    Calculated from {selectedAudit.estimate} of
                    additional work at a $1 USDC/hour demo rate.
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4">
                  <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400">
                    Demo execution
                  </p>
                  <p className="mt-1 text-xl font-bold text-cyan-300">
                    {TEST_SETTLEMENT_AMOUNT} USDC
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                    Base Sepolia testnet
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400">
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
                  complete={
                    selectedAudit.status ===
                    "Settled"
                  }
                  active={isApproved}
                />
                <Pipeline
                  number="04"
                  title="Verify"
                  complete={isVerified}
                  active={
                    selectedAudit.status ===
                      "Settled" &&
                    !isVerified
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={runAnalysis}
                disabled={
                  isRunning ||
                  isExecuting
                }
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning
                  ? "AI Analyzing..."
                  : "Run AI Analysis"}
              </button>
              <button
                onClick={approveSettlement}
                disabled={
                  selectedAudit.status !==
                    "Out of Scope" ||
                  isRunning ||
                  isExecuting
                }
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Approve Settlement
              </button>
              <button
                onClick={executeKeeperHubSettlement}
                disabled={
                  selectedAudit.status !==
                    "Approved" ||
                  isExecuting
                }
                className="rounded-xl border border-slate-700 bg-slate-200 dark:bg-slate-800 px-5 py-3 text-sm font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isExecuting
                  ? "Executing KeeperHub..."
                  : `Execute ${TEST_SETTLEMENT_AMOUNT} USDC Demo`}
              </button>
            </div>
            <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                System Event
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                {message}
              </p>
            </div>
          </div>
        </section>
        {/* On-chain verification */}
        <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="w-full">
              <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400">
                On-chain verification
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Settlement proof
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300 dark:text-slate-400">
                KeeperHub execution must succeed before ScopeGuard
                marks the settlement as verified on Base Sepolia.
              </p>
              {isVerified && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-400">
                      ✓
                    </span>
                    <p className="text-sm font-semibold text-emerald-400">
                      Verified on Base Sepolia
                    </p>
                  </div>
                  {transactionHash && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Transaction hash
                      </p>
                      <p className="mt-2 break-all font-mono text-xs text-cyan-400">
                        {transactionHash}
                      </p>
                    </div>
                  )}
                  {transactionLink && (
                    <a
                      href={transactionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                    >
                      View transaction on BaseScan
                      <span aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  )}
                </div>
              )}
              {!isVerified && (
                <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Verification state
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {selectedAudit.status === "Settled"
                      ? "Settlement completed. Waiting for transaction proof."
                      : selectedAudit.status === "Approved"
                      ? "Settlement approved. Execute through KeeperHub to generate transaction proof."
                      : "Awaiting settlement execution."}
                  </p>
                </div>
              )}
            </div>
            <div
              className={`min-w-[220px] rounded-xl border px-5 py-4 ${
                isVerified
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : selectedAudit.status ===
                    "Approved"
                  ? "border-cyan-400/30 bg-cyan-400/5"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              }`}
            >
              <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                Transaction status
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  isVerified
                    ? "text-emerald-400"
                    : selectedAudit.status ===
                      "Approved"
                    ? "text-cyan-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {isVerified
                  ? "✓ Verified onchain"
                  : selectedAudit.status ===
                    "Approved"
                  ? "Ready for execution"
                  : selectedAudit.status ===
                    "Settled"
                  ? "Awaiting transaction proof"
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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
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
          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-wider ${
          danger
            ? "text-red-400"
            : "text-slate-700 dark:text-slate-300 dark:text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
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
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
      <p className="text-xs text-slate-700 dark:text-slate-300">
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
          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-400">
          {number}
        </span>
        {complete && (
          <span className="text-xs text-emerald-400">
            ✓
          </span>
        )}
        {!complete && active && (
          <span className="text-xs text-cyan-400">
            →
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>
      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
        {complete
          ? "Complete"
          : active
          ? "Ready"
          : "Pending"}
      </p>
    </div>
  );
}
