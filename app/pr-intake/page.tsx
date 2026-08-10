"use client";

import {
 ChangeEvent,
 FormEvent,
 useState,
} from "react";
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

type SavedAudit = {
 id: string;
 pr: string;
 title: string;
 developer: string;
 status: "Out of Scope" | "Approved" | "Settled";
 change: string;
 estimate: string;
 overage: string;
 hourlyRate: number;
 sow: string;
 sowFilename: string;
 confidence: number;
 reasoning: string;
 detectedChanges: string[];
 createdAt: string;
};

const STORAGE_KEY = "scopeguard-current-audit";

export default function PRIntakePage() {
 const [prTitle, setPrTitle] =
 useState("Add PDF Export");

 const [prChanges, setPrChanges] = useState(
 "Added PDF export functionality and supporting export controls."
 );

 const [sow, setSow] = useState(
 "Build 3 React components: UserProfile, Dashboard and Settings."
 );

 const [sowFilename, setSowFilename] =
 useState("");

 const [isUploading, setIsUploading] =
 useState(false);

 const [result, setResult] =
 useState<AnalysisResult | null>(null);

 const [isAnalyzing, setIsAnalyzing] =
 useState(false);

 const [error, setError] = useState("");

 async function handleSowUpload(
 event: ChangeEvent<HTMLInputElement>
 ) {
 const file = event.target.files?.[0];

 if (!file) {
 return;
 }

 setError("");
 setResult(null);
 setIsUploading(true);

 try {
 if (
 file.type !== "application/pdf" &&
 !file.name.toLowerCase().endsWith(".pdf")
 ) {
 throw new Error("Please select a PDF file.");
 }

 const formData = new FormData();

 formData.append("file", file);

 const response = await fetch(
 "/api/upload-sow",
 {
 method: "POST",
 body: formData,
 }
 );

 const data = await response.json();

 if (!response.ok || !data.success) {
 throw new Error(
 data.error || "SOW upload failed."
 );
 }

 const extractedText =
 data.document?.text;

 if (!extractedText) {
 throw new Error(
 "No readable text was extracted from this PDF."
 );
 }

 setSow(extractedText);

 setSowFilename(
 data.document?.filename || file.name
 );
 } catch (err) {
 setError(
 err instanceof Error
 ? err.message
 : "Something went wrong while uploading the SOW."
 );
 } finally {
 setIsUploading(false);

 // Allows the same file to be selected again.
 event.target.value = "";
 }
 }

 async function handleAnalyze(
 event: FormEvent<HTMLFormElement>
 ) {
 event.preventDefault();

 setError("");
 setResult(null);
 setIsAnalyzing(true);

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
 }),
 }
 );

 const data = await response.json();

 if (!response.ok) {
 throw new Error(
 data.error || "Scope analysis failed."
 );
 }

 const analysis = data.analysis;

 if (!analysis) {
 throw new Error(
 "ScopeGuard returned an invalid analysis response."
 );
 }

 const normalizedResult: AnalysisResult = {
 decision:
 analysis.scopeStatus === "out_of_scope"
 ? "Out of Scope"
 : "In Scope",

 confidence: Number(
 analysis.confidence ?? 0
 ),

 summary:
 analysis.reasoning ||
 "ScopeGuard completed the analysis.",

 detectedChanges:
 Array.isArray(
 analysis.detectedChanges
 )
 ? analysis.detectedChanges
 : [],

 estimatedHours: Number(
 analysis.estimatedHours ?? 0
 ),

 hourlyRate: Number(
 analysis.hourlyRate ?? 1
 ),

 overage: Number(
 analysis.settlement ?? 0
 ),
 };

 setResult(normalizedResult);

 /*
 * Save the completed audit locally.
 *
 * This allows the Audit Dashboard to load
 * the exact SOW, PR and AI decision created
 * during this session.
 */
 const savedAudit: SavedAudit = {
 id: `SG-${Date.now()
 .toString()
 .slice(-4)}`,

 pr: "#42",

 title: prTitle,

 developer: "Demo Developer",

 status:
 normalizedResult.decision ===
 "Out of Scope"
 ? "Out of Scope"
 : "Approved",

 change: prChanges,

 estimate: `${normalizedResult.estimatedHours} hours`,

 overage: `$${normalizedResult.overage} USDC`,

 hourlyRate: normalizedResult.hourlyRate,

 sow,

 sowFilename,

 confidence:
 normalizedResult.confidence,

 reasoning:
 normalizedResult.summary,

 detectedChanges:
 normalizedResult.detectedChanges,

 createdAt:
 new Date().toISOString(),
 };

 localStorage.setItem(
 STORAGE_KEY,
 JSON.stringify(savedAudit)
 );
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
 <main className="min-h-screen bg-background text-foreground">
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

 <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
 Give ScopeGuard the pull request details
 and the agreed statement of work. The AI
 will determine whether the requested
 changes fall inside or outside the original
 scope.
 </p>
 </div>
 </header>

 <div className="grid gap-6 lg:grid-cols-3">

 {/* INPUT */}
 <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:col-span-2">

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

 {/* PR TITLE */}
 <div>
 <label
 htmlFor="prTitle"
 className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
 className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
 required
 />
 </div>

 {/* PR CHANGES */}
 <div>
 <label
 htmlFor="prChanges"
 className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
 className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
 required
 />

 <p className="mt-2 text-xs text-slate-600">
 Describe the new functionality,
 files, features, or changes introduced
 by the PR.
 </p>
 </div>

 {/* SOW */}
 <div>
 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

 <label
 htmlFor="sow"
 className="text-sm font-medium text-slate-700 dark:text-slate-300"
 >
 Original Statement of Work
 </label>

 <label
 htmlFor="sowFile"
 className={`inline-flex items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-400/10 ${
 isUploading
 ? "cursor-not-allowed opacity-50"
 : "cursor-pointer"
 }`}
 >
 {isUploading
 ? "Extracting PDF..."
 : "Upload SOW PDF"}

 <input
 id="sowFile"
 type="file"
 accept="application/pdf,.pdf"
 onChange={handleSowUpload}
 disabled={isUploading}
 className="hidden"
 />
 </label>
 </div>

 {/* PDF LOADED */}
 {sowFilename && (
 <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
 <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
 ✓
 </span>

 <div>
 <p className="text-sm font-medium text-emerald-400">
 SOW PDF loaded
 </p>

 <p className="text-xs text-slate-500">
 {sowFilename}
 </p>
 </div>
 </div>
 )}

 {/* EXTRACTED SOW */}
 <textarea
 id="sow"
 value={sow}
 onChange={(event) =>
 setSow(event.target.value)
 }
 rows={8}
 placeholder="Upload a PDF or describe what the freelancer agreed to build..."
 className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
 required
 />

 <p className="mt-2 text-xs text-slate-600">
 Uploading a PDF automatically
 extracts its text into this field.
 You can review or edit the extracted
 SOW before running the analysis.
 </p>
 </div>

 {/* ERROR */}
 {error && (
 <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
 <p className="text-sm text-red-400">
 {error}
 </p>
 </div>
 )}

 {/* ANALYZE */}
 <button
 type="submit"
 disabled={
 isAnalyzing ||
 isUploading ||
 !sow.trim()
 }
 className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {isAnalyzing
 ? "ScopeGuard AI is analyzing..."
 : "Analyze Pull Request"}
 </button>
 </form>
 </section>

 {/* HOW IT WORKS */}
 <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">

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

 {/* RESULT */}
 {result && (
 <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">

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

 {/* AI SUMMARY */}
 <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
 <p className="text-xs uppercase tracking-wider text-slate-600">
 AI Summary
 </p>

 <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
 {result.summary}
 </p>
 </div>

 {/* DETECTED CHANGES */}
 <div className="mt-6">
 <p className="text-xs uppercase tracking-wider text-slate-500">
 Detected Changes
 </p>

 <div className="mt-3 space-y-2">
 {result.detectedChanges.length > 0 ? (
 result.detectedChanges.map(
 (change, index) => (
 <div
 key={`${change}-${index}`}
 className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4"
 >
 <span className="text-cyan-400">
 +
 </span>

 <p className="text-sm text-slate-700 dark:text-slate-300">
 {change}
 </p>
 </div>
 )
 )
 ) : (
 <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
 <p className="text-sm text-slate-500">
 No specific scope keywords were
 detected.
 </p>
 </div>
 )}
 </div>
 </div>

 {/* FINANCIAL ANALYSIS */}
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

 {/* RECOMMENDATION */}
 <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">

 <p className="text-xs uppercase tracking-wider text-cyan-400">
 ScopeGuard Recommendation
 </p>

 <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
 {result.decision === "Out of Scope"
 ? `Additional work detected. Recommended settlement: $${result.overage} USDC.`
 : "The submitted changes appear to remain within the agreed scope. No additional settlement is recommended."}
 </p>

 </div>

 {/* CONTINUE */}
 <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

 <div>
 <p className="text-sm text-slate-700 dark:text-slate-300">
 Audit saved successfully.
 </p>

 <p className="mt-1 text-xs text-slate-500">
 The Audit Dashboard will use this SOW,
 PR and AI decision.
 </p>
 </div>

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

 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-cyan-400">
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
 <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">

 <p className="text-xs text-slate-600">
 {label}
 </p>

 <p
 className={`mt-2 text-lg font-bold ${
 highlight
 ? "text-cyan-400"
 : "text-slate-950 dark:text-white"
 }`}
 >
 {value}
 </p>

 </div>
 );
}
