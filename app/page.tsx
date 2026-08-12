"use client";
import { useEffect, useRef, useState } from "react";
type AuditRecord = {
  id?: string;
  pr?: string;
  title?: string;
  developer?: string;
  status?: string;
  change?: string;
  estimate?: string;
  overage?: string;
  hourlyRate?: number;
  settlementStatus?: string;
  settlementAmount?: string;
  settlementCurrency?: string;
  sow?: string;
  confidence?: number | string;
  reasoning?: string;
  recommendation?: string;
  detectedChanges?: string[];
  newScopeItems?: string[];
  existingScopeItems?: string[];
  estimatedHours?: number;
  transactionHash?: string;
  transactionLink?: string;
};

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
  const [status, setStatus] =
    useState("Waiting for scope analysis");

  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [executionMessage, setExecutionMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionLink, setTransactionLink] = useState("");

  const executionStarted = useRef(false);

  useEffect(() => {
    const storedAudit =
      window.localStorage.getItem("scopeguard-current-audit");

    const storedSettlement =
      window.localStorage.getItem("scopeguard-settlement");

    if (storedAudit) {
      try {
        const parsedAudit = JSON.parse(storedAudit);

        // Intentional hydration from the browser localStorage store.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAudit(parsedAudit);

        if (parsedAudit.status === "Settled") {
          setAnalysisState("success");
          setStatus("Settlement completed");
        } else if (
          parsedAudit.status === "Approved" ||
          parsedAudit.status === "Out of Scope"
        ) {
          setAnalysisState("complete");
          setStatus(
            parsedAudit.status === "Approved"
              ? "Settlement approved"
              : "AI analysis complete"
          );
        }
      } catch {
        console.warn(
          "Could not read the saved ScopeGuard audit."
        );
      }
    }

    if (storedSettlement) {
      try {
        const settlement = JSON.parse(storedSettlement);

        if (settlement.status === "Settled") {
          const hash = settlement.transactionHash || "";
          const link =
            settlement.transactionLink ||
            (hash
              ? `https://sepolia.basescan.org/tx/${hash}`
              : "");

          setTransactionHash(hash);
          setTransactionLink(link);

          if (hash) {
            setAnalysisState("success");
            setStatus("Settlement completed");
            setExecutionMessage(
              "Settlement already confirmed. No additional payment was sent."
            );

            // Keep the saved audit synchronized with the existing
            // settlement proof. This does NOT execute a payment.
            const currentAuditRaw =
              window.localStorage.getItem("scopeguard-current-audit");

            if (currentAuditRaw) {
              try {
                const currentAudit = JSON.parse(currentAuditRaw);

                window.localStorage.setItem(
                  "scopeguard-current-audit",
                  JSON.stringify({
                    ...currentAudit,
                    status: "Settled",
                    settlementStatus: "Settled",
                    settlementAmount: settlement.amount || "3",
                    settlementCurrency: settlement.currency || "USDC",
                    transactionHash: hash,
                    transactionLink: link,
                  })
                );

                setAudit({
                  ...currentAudit,
                  status: "Settled",
                  settlementStatus: "Settled",
                  settlementAmount: settlement.amount || "3",
                  settlementCurrency: settlement.currency || "USDC",
                  transactionHash: hash,
                  transactionLink: link,
                });
              } catch {
                console.warn(
                  "Could not synchronize the saved audit with settlement proof."
                );
              }
            }
          }
        }
      } catch {
        console.warn(
          "Could not read the saved ScopeGuard settlement."
        );
      }
    }
  }, []);

  const handleAnalyze = async () => {
    if (analysisState === "analyzing") {
      return;
    }

    setAnalysisState("analyzing");
    setAnalysisStep(0);
    setExecutionMessage("");
    setStatus(analysisSteps[0]);

    try {
      for (let i = 0; i < analysisSteps.length; i++) {
        setAnalysisStep(i);
        setStatus(analysisSteps[i]);

        if (i < analysisSteps.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 450));
        }
      }

      const storedAudit =
        window.localStorage.getItem("scopeguard-current-audit");

      const sourceAudit = storedAudit
        ? JSON.parse(storedAudit)
        : {};

      const sow =
        sourceAudit.sow ||
        "Build 3 React components: UserProfile, Dashboard and Settings.";

      const prTitle =
        sourceAudit.title ||
        "Add PDF Export";

      const prChanges =
        sourceAudit.change ||
        "Added PDF export functionality and supporting export controls.";

      const response = await fetch("/api/analyze-scope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sow,
          prTitle,
          prChanges,
          hourlyRate: sourceAudit.hourlyRate || 1,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.analysis) {
        throw new Error(
          data.error || "Scope analysis failed"
        );
      }

      const result = data.analysis;

      const nextAudit = {
        ...sourceAudit,
        pr: sourceAudit.pr || "#42",
        title: prTitle,
        sow,
        change: prChanges,
        status:
          result.scopeStatus === "out_of_scope"
            ? "Out of Scope"
            : "Within Scope",
        confidence: result.confidence,
        estimate: `${result.estimatedHours} hours`,
        hourlyRate: result.hourlyRate,
        overage: `${result.settlement} USDC`,
        settlementStatus:
          result.scopeStatus === "out_of_scope"
            ? "Required"
            : "Not required",
        settlementAmount: String(result.settlement),
        settlementCurrency: result.currency,
        detectedChanges: result.detectedChanges,
        newScopeItems: result.newScopeItems,
        existingScopeItems: result.existingScopeItems,
        reasoning: result.reasoning,
        recommendation: result.recommendation,
      };

      window.localStorage.setItem(
        "scopeguard-current-audit",
        JSON.stringify(nextAudit)
      );

      setAudit(nextAudit);
      setAnalysisState("complete");
      setStatus("AI analysis complete");
    } catch (error) {
      setAnalysisState("error");

      const message =
        error instanceof Error
          ? error.message
          : "Analysis failed";

      setStatus(message);
      setExecutionMessage(
        "AI analysis did not complete. Please try again."
      );
    }
  };

  // Settlement execution implementation retained for the execution control.
  const handleExecute = async () => {
    // Prevent duplicate payment execution.
    if (executionStarted.current) {
      return;
    }

    // If this settlement was already completed, never pay again.
    const storedSettlement =
      window.localStorage.getItem("scopeguard-settlement");

    if (storedSettlement) {
      try {
        const settlement = JSON.parse(storedSettlement);

        if (
          settlement.status === "Settled" &&
          settlement.transactionHash
        ) {
          setTransactionHash(settlement.transactionHash);
          setTransactionLink(
            settlement.transactionLink || ""
          );

          setAnalysisState("success");
          setStatus("Settlement completed");
          setExecutionMessage(
            "Settlement already confirmed. No additional payment was sent."
          );

          return;
        }
      } catch {
        console.warn(
          "Could not verify existing settlement."
        );
      }
    }

    executionStarted.current = true;

    setAnalysisState("executing");
    setExecutionMessage("");
    setTransactionHash("");
    setTransactionLink("");
    setStatus("Connecting to KeeperHub...");
    try {
      const response = await fetch("/api/keeperhub/execute", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
amount: audit?.settlementAmount || "3",
recipientAddress: "0x0D392ba82e6c86192cB92fd568BDCf33e9d2295E",
network: "84532",
execute: true,
}),
});
 const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "KeeperHub execution failed"
        );
      }
      setAnalysisState("success");
      setStatus("KeeperHub execution completed");

      const resolvedHash =
        data.transactionHash ||
        data.keeperHub?.transactionHash ||
        "";
      const resolvedLink =
        data.transactionLink ||
        data.keeperHub?.transactionLink ||
        "";

      setTransactionHash(resolvedHash);
      setTransactionLink(resolvedLink);

      window.localStorage.setItem(
        "scopeguard-settlement",
        JSON.stringify({
          auditId: "SG-042",
          status: "Settled",
          amount: data.settlement?.amount || "3",
          currency: data.settlement?.currency || "USDC",
          transactionHash: resolvedHash,
          transactionLink: resolvedLink,
        })
      );

      setExecutionMessage(
        "Settlement confirmed on Base Sepolia. Audit proof has been recorded."
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
  return (
    <main className="min-h-screen bg-background text-foreground">
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
          <p className="mt-4 max-w-3xl text-slate-700 dark:text-slate-300">
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
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                Compare the pull request against the original agreement.
              </p>
            </div>

            {analysisState === "success" && (
              <span className="w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm font-semibold text-emerald-400 md:ml-auto">
                Settlement confirmed ✓
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">

            {analysisState === "complete" &&
              audit?.status === "Out of Scope" && (
                <button
                  type="button"
                  onClick={handleExecute}
                  className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Approve {audit?.overage || "3 USDC"} Settlement →
                </button>
              )}


          </div>
          {/* Analysis progress */}
          {isAnalyzing && (
            <div className="mt-5 rounded-xl border border-[#e3ddc9] dark:border-slate-800 bg-[#ece6d5] dark:bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {status}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
                  {analysisStep + 1}/{analysisSteps.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
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
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Scope deviation detected and settlement calculated.
                </p>
              </div>
            </div>
          )}
        </section>
        {/* Main Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* PR Analysis */}
          <div className="rounded-2xl border border-[#e3ddc9] dark:border-slate-800 bg-[#fbf9f2] dark:bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  GitHub Pull Request
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {audit?.pr || "#42"} —{" "}
                  {audit?.title || "Add PDF Export"}
                </h2>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm ${
                  audit?.status === "Within Scope"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {audit?.status === "Within Scope"
                  ? "Within scope"
                  : audit?.status === "Out of Scope"
                    ? "Out of scope"
                    : "Awaiting analysis"}
              </span>
            </div>
            <div className="space-y-4">
              {/* Original SOW */}
              <div className="rounded-xl bg-[#ece6d5] dark:bg-slate-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300 dark:text-slate-400">
                  Original SOW
                </p>
                <p className="mt-2 text-slate-700 dark:text-slate-300">
                  {audit?.sow || (
                    <>
                      Build 3 React components:
                      <span className="font-medium text-slate-950 dark:text-white">
                        {" "}
                        UserProfile, Dashboard and Settings.
                      </span>
                    </>
                  )}
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
                <p className="mt-2 text-slate-700 dark:text-slate-200">
                  {audit?.change ||
                    "Added PDF export functionality and supporting export controls."}
                </p>
              </div>
              {/* AI Findings */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                    AI Findings
                  </p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                    {audit?.confidence != null ? `${audit.confidence}%` : "—"} confidence
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
                    description="The detected work represents an estimated 3 additional engineering hours at a $1 USDC/hour demo rate."
                  />
                </div>
              </div>
              {/* Metrics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric
                  label="Estimated work"
                  value={audit?.estimate || "—"}
                />
                <Metric
                  label="Hourly rate"
                  value={audit?.hourlyRate != null ? `$${audit.hourlyRate} USDC/hr` : "—"}
                />
                <Metric
                  label="Overage"
                  value={audit?.overage || "—"}
                />
              </div>
            </div>
          </div>
          {/* AI Decision */}
          <div className="rounded-2xl border border-[#e3ddc9] dark:border-slate-800 bg-[#fbf9f2] dark:bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                AI DECISION
              </p>
              <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-400">
                AI
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold">
              {audit?.status === "Within Scope"
                ? "Within scope"
                : audit?.status === "Out of Scope"
                  ? "Settlement required"
                  : "Awaiting analysis"}
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {audit?.reasoning ||
                "ScopeGuard determined whether the pull request matches the original agreement."}
            </p>

            {/* AI confidence */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  AI confidence
                </span>
                <span className="text-sm font-bold text-red-400">
                  {audit?.confidence != null
                    ? `${audit.confidence}%`
                    : "—"}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-red-400 transition-all duration-500"
                  style={{
                    width:
                      audit?.confidence != null
                        ? `${audit.confidence}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Settlement details */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Freelancer
                </span>
                <span className="text-sm font-medium">
                  {audit?.developer || "Demo Developer"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Settlement
                </span>
                <span className="text-sm font-semibold text-cyan-400">
                  {audit?.overage || "—"}
                </span>
              </div>
            </div>

            {/* Confirmed onchain payment */}
            {analysisState === "success" && transactionHash && (
              <div className="mt-6">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-emerald-400">
                    ✓ {audit?.overage || "3 USDC"} Paid on Base Sepolia
                  </p>
                </div>

                <p className="mt-2 text-center text-xs text-slate-700 dark:text-slate-300">
                  Payment Confirmed &amp; Settled Onchain
                </p>

                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Tx: {transactionHash.slice(0, 10)}...
                  {transactionHash.slice(-8)}
                </p>

                {transactionLink && (
                  <p className="mt-2 text-center">
                    <a
                      href={transactionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                    >
                      View on BaseScan →
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Pending / execution status */}
            {executionMessage && !transactionHash && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 ${
                  analysisState === "error"
                    ? "border-red-500/20 bg-red-500/5 text-red-400"
                    : "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
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
        <section className="mt-8 rounded-2xl border border-[#e3ddc9] dark:border-slate-800 bg-[#fbf9f2] dark:bg-slate-900 p-6">
          <div className="mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
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
        <footer className="mt-8 text-center text-xs text-slate-700 dark:text-slate-300">
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
    <div className="rounded-xl border border-[#e3ddc9] dark:border-slate-800 p-4">
      <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-slate-400">
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
        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300 dark:text-slate-400">
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
    <div className="rounded-xl border border-[#e3ddc9] dark:border-slate-800 bg-[#ece6d5] dark:bg-slate-950 p-4">
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-cyan-400 text-slate-950"
            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        }`}
      >
        {number}
      </div>
      <h3 className="font-semibold">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-5 text-slate-700 dark:text-slate-300 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
