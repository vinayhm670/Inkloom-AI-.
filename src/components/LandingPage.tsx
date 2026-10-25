import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Search,
  Scale,
  FileCheck,
  History,
  Lock,
  Layers,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { DEMO_BRAND_ACME } from '../data/initialData';

interface LandingPageProps {
  onStartReview: (initialContent?: string) => void;
  onOpenDashboard: () => void;
  onOpenCopilot: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartReview,
  onOpenDashboard,
  onOpenCopilot,
}) => {
  // Live Sandbox state
  const defaultSample = "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.";
  const [sandboxText, setSandboxText] = useState(defaultSample);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [hasAppliedCorrection, setHasAppliedCorrection] = useState(false);

  const handleRunLiveCheck = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 600);
  };

  const handleApplyCorrection = () => {
    setSandboxText("Fast storage backed by a 99.9% uptime SLA. Try Acme Vault.");
    setHasAppliedCorrection(true);
  };

  const handleResetSample = () => {
    setSandboxText(defaultSample);
    setAnalyzed(false);
    setHasAppliedCorrection(false);
  };

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-20">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide shadow-sm animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Brand Governance Before Publication</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Check every claim.{' '}
          <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Protect every brand.
          </span>{' '}
          <br className="hidden sm:inline" />
          Publish with confidence.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          INKLOOM AI is an enterprise pre-publication governance platform that verifies marketing
          content against approved company facts, brand terminology, tone of voice, visual identity,
          and evidence policies before publication.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onStartReview()}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Launch Content Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Ask INKLOOM Copilot</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white transition-colors"
          >
            <span>View Governance Dashboard</span>
          </button>
        </div>
      </div>

      {/* Interactive Live Sandbox Section: Demonstration Brand Acme Vault */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/95 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Fictional Demonstration Brand
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {DEMO_BRAND_ACME.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Live Governance Sandbox: Inspect Unverified Copy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Test how INKLOOM AI catches prohibited product names, unsupported superlatives, and SLA contradictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Sample</span>
            </button>
          </div>
        </div>

        {/* Sandbox Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left: Input Textarea & Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Marketing Copy to Audit:</span>
                <span className="text-[11px] text-slate-400">Sample Campaign: LinkedIn Cloud Ad</span>
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-950/60 p-3.5 focus-within:border-sky-500 transition-colors">
                <textarea
                  value={sandboxText}
                  onChange={(e) => {
                    setSandboxText(e.target.value);
                    setAnalyzed(false);
                    setHasAppliedCorrection(false);
                  }}
                  rows={4}
                  className="w-full bg-transparent text-slate-100 text-sm font-sans focus:outline-none resize-none leading-relaxed"
                  placeholder="Paste marketing copy here..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={handleRunLiveCheck}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Claims...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Live Governance Check</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onStartReview(sandboxText)}
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                <span>Open in Full 8-Step Reviewer</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Fact Reference Pill for Demo Brand */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Acme Vault Indexed Governance Policy:</span>
              </div>
              <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-slate-300">Fact ID F-014:</strong> Uptime SLA is guaranteed at 99.9% (not 100%).
                </li>
                <li>
                  <strong className="text-slate-300">Naming Rule:</strong> Product name is &quot;Acme Vault&quot;. Term &quot;Acme Cloud&quot; is deprecated & prohibited.
                </li>
                <li>
                  <strong className="text-slate-300">Evidence Rule:</strong> Claim &quot;#1 fastest&quot; requires audited third-party benchmark certification.
                </li>
                <li>
                  <strong className="text-slate-300">Visual Standard:</strong> Minimum 4.5:1 text contrast for body typography.
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Live Findings & Corrective Action */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Governance Audit Findings
              </span>
              {analyzed && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {hasAppliedCorrection ? '0 Active Issues (Resolved)' : '3 Violations Detected'}
                </span>
              )}
            </div>

            {!analyzed && !hasAppliedCorrection ? (
              <div className="h-64 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Search className="w-8 h-8 text-slate-600" />
                <p className="text-xs">
                  Click <strong className="text-slate-400">&quot;Run Live Governance Check&quot;</strong> to evaluate this copy against Acme Vault facts and terminology policies.
                </p>
              </div>
            ) : hasAppliedCorrection ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Compliant Revision Generated (Version 2)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-sm text-slate-200 font-mono">
                  &quot;Fast storage backed by a 99.9% uptime SLA. Try Acme Vault.&quot;
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Product name corrected to approved &quot;Acme Vault&quot;.</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Replaced unsupported &quot;India&apos;s #1 fastest&quot; superlative.</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Uptime statement verified against Fact ID F-014 (99.9% SLA).</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => onStartReview(sandboxText)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold transition-colors"
                  >
                    <span>Proceed to Human Approval Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {/* Finding 1: Deprecated name */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        CRITICAL
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        Prohibited Product Name: &quot;Acme Cloud&quot;
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Rule ID: N-02</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Official product name is <strong>Acme Vault</strong>. &quot;Acme Cloud&quot; was deprecated in Q2 2024.
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Evidence: Acme Brand Guidelines 2026 §1.2</span>
                    <span className="text-emerald-400 font-medium">Correction: Acme Vault</span>
                  </div>
                </div>

                {/* Finding 2: Unsupported comparative claim */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        CRITICAL
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        Unsupported Comparative Claim: &quot;India&apos;s #1 fastest&quot;
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Evidence Required</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Comparative superlatives require audited benchmark reports. 0 matching benchmark certificates exist in the knowledge library.
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Status: Evidence Not Found</span>
                    <span className="text-emerald-400 font-medium">Correction: Fast storage</span>
                  </div>
                </div>

                {/* Finding 3: Fact conflict uptime */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        CRITICAL
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        Fact Conflict: &quot;guaranteed 100% uptime&quot;
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Fact ID: F-014</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Approved uptime SLA is <strong>99.9%</strong>. Absolute 100% guarantees expose the brand to contractual breaches.
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Source: Acme Vault SLA Spec v4.2 §3.2</span>
                    <span className="text-emerald-400 font-medium">Correction: 99.9% uptime SLA</span>
                  </div>
                </div>

                {/* 1-Click Correction Bar */}
                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold text-sky-400">Suggested Resolution:</span>
                    <div className="text-[11px] text-slate-300 italic mt-0.5">
                      &quot;Fast storage backed by a 99.9% uptime SLA. Try Acme Vault.&quot;
                    </div>
                  </div>
                  <button
                    onClick={handleApplyCorrection}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 whitespace-nowrap shadow transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply Correction</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The 8-Step Governance Workflow Breakdown */}
      <div className="space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            End-To-End Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The 8-Step Governance Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Every piece of marketing collateral progresses through 8 connected stages with persistent revision history and auditable human sign-off.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              step: '1',
              title: 'Configure',
              desc: 'Select brand, campaign, content format & audience',
              icon: Layers,
            },
            {
              step: '2',
              title: 'Submit',
              desc: 'Paste drafts or upload creative copy & assets',
              icon: FileCheck,
            },
            {
              step: '3',
              title: 'Check',
              desc: 'Automated scan against verified facts & rules',
              icon: Search,
            },
            {
              step: '4',
              title: 'Explain',
              desc: 'Structured findings with Fact IDs & citations',
              icon: AlertTriangle,
            },
            {
              step: '5',
              title: 'Revise',
              desc: 'Side-by-side diffs & 1-click suggested edits',
              icon: RefreshCw,
            },
            {
              step: '6',
              title: 'Approve',
              desc: 'Human authorization required before publishing',
              icon: Lock,
            },
            {
              step: '7',
              title: 'Audit',
              desc: 'Immutable chronological action history',
              icon: History,
            },
            {
              step: '8',
              title: 'Insights',
              desc: 'Governance health, turnaround & trend analytics',
              icon: Scale,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900/90 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10">
                    Step {item.step}
                  </span>
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Governance Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Factual Verification</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminate conflicting numbers, fictitious uptime guarantees, and unsupported superlatives. Every statement is checked against indexed company fact records (e.g. Fact ID F-014).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Scale className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Terminology & Tone Policing</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Automatically detect deprecated brand names, prohibited competitive terms, and aggressive marketing language that violates enterprise tone directives.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Human Approval Lock</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The AI never automatically approves or publishes. Decisions are version-locked: any subsequent edits invalidate previous sign-offs and mandate re-inspection.
          </p>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-white">
            Ready to safeguard your pre-publication marketing?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Configure your company facts, upload brand guides, and protect your brand equity with INKLOOM AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartReview()}
            className="px-5 py-3 rounded-xl font-semibold text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-md cursor-pointer"
          >
            Create First Review
          </button>
          <button
            onClick={onOpenCopilot}
            className="px-4 py-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Open Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
