import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck,
  RefreshCw,
  Edit3,
  Layers,
  History,
  Lock,
  UserCheck,
  MessageSquare,
  FileText,
  Upload,
  AlertCircle,
  Eye,
  Check,
  XCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  Review,
  BrandProfile,
  Finding,
  ContentRevision,
  UserRole,
} from '../types';
import { createRevision, submitApproverDecision, addReviewComment } from '../services/api';

interface ReviewWorkflowProps {
  review: Review | null;
  brands: BrandProfile[];
  currentRole: UserRole;
  onSaveReview: (review: Review) => void;
  onNewReviewSubmit: (data: {
    brandId: string;
    title: string;
    campaignName: string;
    contentType: string;
    content: string;
  }) => Promise<Review>;
  onGoToApprovals?: () => void;
}

export const ReviewWorkflow: React.FC<ReviewWorkflowProps> = ({
  review: initialReview,
  brands,
  currentRole,
  onSaveReview,
  onNewReviewSubmit,
  onGoToApprovals,
}) => {
  // Current active review state
  const [activeReview, setActiveReview] = useState<Review | null>(initialReview);

  // Workflow stage: 1=Configure, 2=Submit, 3=Check, 4=Explain, 5=Revise, 6=Approve, 7=Audit, 8=Insights
  const [currentStep, setCurrentStep] = useState<number>(initialReview ? 4 : 1);

  // New review form fields
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    brands.find((b) => b.isDemo)?.id || brands[0]?.id || ''
  );
  const [title, setTitle] = useState<string>('Acme Vault Q4 Launch Social Copy');
  const [campaignName, setCampaignName] = useState<string>('Enterprise Security Sprint');
  const [contentType, setContentType] = useState<string>('Social Ad Copy');
  const [content, setContent] = useState<string>(
    "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now."
  );

  // Revision editing state
  const [revisionDraft, setRevisionDraft] = useState<string>('');
  const [revisionNotes, setRevisionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [approverFeedback, setApproverFeedback] = useState<string>('');

  useEffect(() => {
    if (initialReview) {
      setActiveReview(initialReview);
      setRevisionDraft(initialReview.currentContent);
      setSelectedBrandId(initialReview.brandId);
      setTitle(initialReview.title);
      setCampaignName(initialReview.campaignName);
      setContentType(initialReview.contentType);
      setContent(initialReview.originalContent);
    }
  }, [initialReview]);

  const activeBrand =
    brands.find((b) => b.id === (activeReview ? activeReview.brandId : selectedBrandId)) ||
    brands[0];

  const steps = [
    { num: 1, name: 'Configure' },
    { num: 2, name: 'Submit' },
    { num: 3, name: 'Check' },
    { num: 4, name: 'Explain' },
    { num: 5, name: 'Revise' },
    { num: 6, name: 'Approve' },
    { num: 7, name: 'Audit' },
    { num: 8, name: 'Insights' },
  ];

  // Quick fill button: Load Acme Vault demo sample
  const handleLoadDemoSample = () => {
    const acmeBrand = brands.find((b) => b.isDemo) || brands[0];
    if (acmeBrand) setSelectedBrandId(acmeBrand.id);
    setTitle('Acme Vault Q4 Launch Social Copy');
    setCampaignName('Enterprise Security Sprint');
    setContentType('Social Ad Copy');
    setContent("Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.");
  };

  // Submit initial review
  const handleSubmitContent = async () => {
    setIsSubmitting(true);
    setCurrentStep(3); // Show Check state
    try {
      const created = await onNewReviewSubmit({
        brandId: selectedBrandId,
        title,
        campaignName,
        contentType,
        content,
      });
      setActiveReview(created);
      setRevisionDraft(created.currentContent);
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(4); // Move to Explain
      }, 700);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setCurrentStep(2);
    }
  };

  // Apply single correction to revision draft
  const handleApplySingleCorrection = (finding: Finding) => {
    if (!revisionDraft) return;
    const regex = new RegExp(finding.relevantText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const updated = revisionDraft.replace(regex, finding.suggestedCorrection);
    setRevisionDraft(updated);
  };

  // Apply all suggested corrections
  const handleApplyAllCorrections = () => {
    if (!activeReview) return;
    let updated = revisionDraft || activeReview.currentContent;
    for (const f of activeReview.findings) {
      if (f.suggestedCorrection && f.relevantText) {
        const regex = new RegExp(f.relevantText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        updated = updated.replace(regex, f.suggestedCorrection);
      }
    }
    // Clean up sample sentence if matching
    if (updated.includes('Acme Cloud')) {
      updated = updated.replace(/Acme Cloud/gi, 'Acme Vault');
    }
    if (updated.includes("India's #1 fastest")) {
      updated = updated.replace(/India's #1 fastest/gi, 'high-performance');
    }
    if (updated.includes('guaranteed 100% uptime')) {
      updated = updated.replace(/guaranteed 100% uptime/gi, 'backed by a 99.9% uptime SLA');
    }
    if (updated.includes('Try it now!')) {
      updated = updated.replace(/Try it now!/gi, 'Try Acme Vault.');
    }
    setRevisionDraft(updated);
  };

  // Save new revision
  const handleSaveRevision = async () => {
    if (!activeReview) return;
    setIsSubmitting(true);
    try {
      const updatedReview = await createRevision(activeReview.id, {
        newContent: revisionDraft,
        authorRole: currentRole,
        authorName: currentRole === 'creator' ? 'Alex Mercer (Creator)' : 'Governance Reviewer',
        changeNotes: revisionNotes || `Applied compliance corrections for version v${activeReview.currentVersion + 1}`,
      });
      setActiveReview(updatedReview);
      onSaveReview(updatedReview);
      setIsSubmitting(false);
      setCurrentStep(6); // Move to Approve step
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Approver decision handler
  const handleDecision = async (decision: 'approved' | 'rejected' | 'returned_for_revision') => {
    if (!activeReview) return;
    try {
      const updated = await submitApproverDecision(activeReview.id, {
        decision,
        approverName: 'Elena Rostova',
        approverRole: 'approver',
        comments: approverFeedback || `Decision recorded as ${decision}`,
      });
      setActiveReview(updated);
      onSaveReview(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Add review comment
  const handleAddComment = async () => {
    if (!activeReview || !newComment.trim()) return;
    try {
      await addReviewComment(activeReview.id, {
        authorName: 'Sarah Jenkins',
        authorRole: currentRole,
        message: newComment.trim(),
      });
      setNewComment('');
      // Reload or append comment
      activeReview.comments.push({
        id: `cmt-${Date.now()}`,
        authorName: 'Sarah Jenkins',
        authorRole: currentRole,
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
        message: newComment.trim(),
      });
      setActiveReview({ ...activeReview });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* 8-Step Progress Ribbon */}
      <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur">
        <div className="flex items-center overflow-x-auto pb-1 gap-1.5 sm:gap-2 scrollbar-none">
          {steps.map((st) => {
            const isActive = currentStep === st.num;
            const isPassed = currentStep > st.num;
            return (
              <button
                key={st.num}
                onClick={() => {
                  if (activeReview || st.num <= 2) setCurrentStep(st.num);
                }}
                disabled={!activeReview && st.num > 2}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-md scale-105'
                    : isPassed
                    ? 'bg-slate-800 text-sky-400 hover:bg-slate-700'
                    : 'text-slate-500 hover:text-slate-400 disabled:opacity-40'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : isPassed
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPassed ? '✓' : st.num}
                </span>
                <span>{st.name}</span>
                {st.num < 8 && <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1: Configure */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Step 1 of 8: Configure Governance
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Configure Content Review</h2>
            <p className="text-xs text-slate-400">
              Select the active brand profile, campaign context, and content type.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Brand Profile:
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.isDemo ? '(Fictional Demo Brand)' : ''}
                  </option>
                ))}
              </select>
              {activeBrand.isDemo && (
                <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Demonstration Brand with Fact ID F-014 (99.9% SLA) and deprecated Acme Cloud rule.</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Review Title:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Q4 Cloud Security Campaign"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Campaign Name:
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Enterprise Launch 2026"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Content Format:
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Social Ad Copy">Social Ad Copy (LinkedIn, X, Meta)</option>
                <option value="Landing Page Hero">Website Landing Page Hero</option>
                <option value="Press Release">Official Press Release</option>
                <option value="Email Newsletter">Enterprise Email Newsletter</option>
                <option value="Technical Whitepaper Summary">Whitepaper Executive Summary</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handleLoadDemoSample}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-sky-400 bg-sky-950/40 border border-sky-500/30 hover:bg-sky-900/40 transition-colors"
            >
              Load Acme Vault Test Sample
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer"
            >
              <span>Next: Submit Content</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Submit */}
      {currentStep === 2 && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Step 2 of 8: Submit Copy
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Submit Draft Copy for Analysis</h2>
              <p className="text-xs text-slate-400">
                Paste draft copy or load preconfigured governance test sentences.
              </p>
            </div>
            <button
              onClick={handleLoadDemoSample}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
            >
              Insert Acme Vault Sample
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Marketing Text / Creative Copy:</span>
              <span className="text-[11px] text-slate-400">{content.length} characters</span>
            </label>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 focus-within:border-sky-500 transition-colors">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-transparent text-slate-100 text-sm font-sans focus:outline-none resize-none leading-relaxed"
                placeholder="Paste marketing copy to be checked..."
              />
            </div>

            {/* Asset Attachment mockup */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Optional Asset: (Ad graphic, mockup banner, or collateral PDF)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">PDF / PNG / JPG</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleSubmitContent}
              disabled={!content.trim() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>Submit &amp; Run Governance Check</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Check (Analyzing State) */}
      {currentStep === 3 && (
        <div className="max-w-2xl mx-auto p-12 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-4 border-t-sky-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Running AI Brand Governance Engine</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Checking claims against indexed Fact ID records, scanning prohibited terms, evaluating
              enterprise tone directives, and verifying accessibility text contrast.
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Explain (Structured Findings) */}
      {currentStep === 4 && activeReview && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  Step 4 of 8: Explain Findings
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                  Review #{activeReview.id}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">{activeReview.title}</h2>
              <p className="text-xs text-slate-400">
                Brand: <strong className="text-slate-200">{activeBrand.name}</strong> • Format:{' '}
                {activeReview.contentType} • Current Version: v{activeReview.currentVersion}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <span>Proceed to Revise (Step 5)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submitted Content Banner */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Evaluated Content (Version {activeReview.currentVersion}):
            </span>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-sm font-sans text-slate-200 leading-relaxed">
              &quot;{activeReview.currentContent}&quot;
            </div>
          </div>

          {/* Findings Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Active Governance Findings ({activeReview.findings.length})
              </h3>
              <span className="text-xs text-slate-400">
                {activeReview.findings.filter((f) => f.severity === 'critical').length} Critical,{' '}
                {activeReview.findings.filter((f) => f.severity === 'medium').length} Medium
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {activeReview.findings.map((f) => {
                const sevBadge =
                  f.severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : f.severity === 'high'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : f.severity === 'medium'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40';

                return (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sevBadge}`}
                        >
                          {f.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                          {f.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">{f.problemDescription}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{f.id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          Problematic Text / Claim:
                        </span>
                        <span className="font-mono text-rose-300 font-semibold text-xs">
                          &quot;{f.relevantText}&quot;
                        </span>
                        <p className="text-slate-300 text-xs mt-1">{f.explanation}</p>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          Evidence Source &amp; Applicable Rule:
                        </span>
                        <div className="text-sky-300 font-medium">{f.evidenceSource || 'Brand Rule Engine'}</div>
                        <p className="text-slate-400 text-[11px]">{f.applicableRule}</p>
                      </div>
                    </div>

                    {/* Suggested Correction Bar */}
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                          Suggested Compliant Replacement:
                        </span>
                        <div className="text-slate-200 font-medium mt-0.5">
                          &quot;{f.suggestedCorrection}&quot;
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleApplySingleCorrection(f);
                          setCurrentStep(5);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply &amp; Edit in Revise</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Revise (Diff & Correction Engine) */}
      {currentStep === 5 && activeReview && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Step 5 of 8: Revise Content
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Side-by-Side Revision Workspace</h2>
              <p className="text-xs text-slate-400">
                Apply suggested corrections, manually polish phrasing, and record Revision v
                {activeReview.currentVersion + 1}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyAllCorrections}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply All Corrections</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Diff Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Submission (v1) */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">
                  Original Content (Version 1)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Immutable</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 font-sans leading-relaxed min-h-[140px]">
                {activeReview.originalContent}
              </div>
              <p className="text-[11px] text-slate-500">
                Created: {activeReview.createdAt} by Alex Mercer (Creator)
              </p>
            </div>

            {/* Right: New Revision Editor */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-400 uppercase tracking-wider">
                  Target Revision (Version {activeReview.currentVersion + 1})
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                  Editable
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 focus-within:border-sky-500 transition-colors">
                <textarea
                  value={revisionDraft}
                  onChange={(e) => setRevisionDraft(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent text-slate-100 text-sm font-sans focus:outline-none resize-none leading-relaxed"
                  placeholder="Revise content here..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Revision Change Notes:
                </label>
                <input
                  type="text"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Corrected SLA to 99.9% and product name to Acme Vault per Fact F-014."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Explain</span>
            </button>

            <button
              onClick={handleSaveRevision}
              disabled={isSubmitting || !revisionDraft.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>Save Revision v{activeReview.currentVersion + 1} &amp; Proceed to Approval</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Approve (Human-in-the-loop Approval) */}
      {currentStep === 6 && activeReview && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Step 6 of 8: Human Approval Center
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Review Approval Decision</h2>
                <p className="text-xs text-slate-400">
                  Version locked: Authorization strictly applies to Version v
                  {activeReview.currentVersion}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Status: {activeReview.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* AI Non-Publishing Guarantee Callout */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block font-semibold mb-0.5">
                  Mandatory Governance Rule:
                </strong>
                The AI governance engine flags violations and verifies facts, but{' '}
                <strong className="text-white">never automatically approves or publishes</strong>{' '}
                content. Human review and signature is mandatory.
              </div>
            </div>

            {/* Current Version Content */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Submitted Content (Version {activeReview.currentVersion}):
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm font-sans text-slate-100 leading-relaxed font-mono">
                {activeReview.currentContent}
              </div>
            </div>

            {/* Approver Decision Controls (Visible to Approver role) */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Authorized Sign-off Panel (Current Role: {currentRole})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Authorized Approver: Elena Rostova
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Approver Comments / Decision Notes:
                </label>
                <textarea
                  value={approverFeedback}
                  onChange={(e) => setApproverFeedback(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                  placeholder="Add approval justification, compliance sign-off or required revision feedback..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDecision('returned_for_revision')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  Return for Revision
                </button>

                <button
                  onClick={() => handleDecision('rejected')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                >
                  Reject Copy
                </button>

                <button
                  onClick={() => handleDecision('approved')}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Version v{activeReview.currentVersion}</span>
                </button>
              </div>
            </div>

            {/* Recorded Decision Callout if present */}
            {activeReview.approverDecision && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5 text-xs text-slate-300 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Recorded Decision: {activeReview.approverDecision.decision.toUpperCase()} on Version{' '}
                    v{activeReview.approverDecision.approvedVersion}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Signed by: {activeReview.approverDecision.approverName} ({activeReview.approverDecision.approverRole}) at{' '}
                  {activeReview.approverDecision.timestamp}
                </p>
                {activeReview.approverDecision.comments && (
                  <p className="italic text-slate-300">&quot;{activeReview.approverDecision.comments}&quot;</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Revise</span>
            </button>

            <button
              onClick={() => setCurrentStep(7)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer"
            >
              <span>View Audit History (Step 7)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 7: Audit (Review-Specific Audit Log) */}
      {currentStep === 7 && activeReview && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Step 7 of 8: Audit Trail
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Review Revision History &amp; Audit Log</h2>
              <p className="text-xs text-slate-400">
                Traceable, immutable record of every submission, automated finding, and approver action.
              </p>
            </div>

            {/* Revisions Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Version History ({activeReview.revisions.length} versions)
              </h3>
              <div className="space-y-2">
                {activeReview.revisions.map((rev) => (
                  <div
                    key={rev.version}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400 font-mono">
                        Version v{rev.version}
                      </span>
                      <span className="text-slate-500 text-[11px]">{rev.timestamp}</span>
                    </div>
                    <p className="text-slate-300 font-mono text-xs">{rev.content}</p>
                    <div className="text-[11px] text-slate-400">
                      Author: {rev.authorName} ({rev.authorRole}) • {rev.changeNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Governance Comments &amp; Notes</span>
              </h3>

              <div className="space-y-2">
                {activeReview.comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No comments yet on this review.</p>
                ) : (
                  activeReview.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-slate-300">
                          {cmt.authorName} ({cmt.authorRole})
                        </span>
                        <span>{cmt.timestamp}</span>
                      </div>
                      <p className="text-slate-200">{cmt.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Box */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a reviewer note..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(6)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Approval</span>
            </button>

            <button
              onClick={() => setCurrentStep(8)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer"
            >
              <span>View Insights (Step 8)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Insights */}
      {currentStep === 8 && activeReview && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Step 8 of 8: Governance Insights
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Review Performance &amp; Metrics</h2>
              <p className="text-xs text-slate-400">
                Turnaround efficiency, compliance improvement across revisions, and policy metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Total Versions</span>
                <div className="text-2xl font-bold text-sky-400">v{activeReview.currentVersion}</div>
                <p className="text-[11px] text-slate-500">
                  {activeReview.revisions.length - 1} corrective iterations
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Findings Resolved</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {activeReview.findings.filter((f) => f.severity === 'critical').length === 0
                    ? '100%'
                    : 'In Progress'}
                </div>
                <p className="text-[11px] text-slate-500">Fact ID &amp; terminology rules applied</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Final Decision</span>
                <div className="text-2xl font-bold text-amber-300 capitalize">
                  {activeReview.status.replace('_', ' ')}
                </div>
                <p className="text-[11px] text-slate-500">Traceable in audit history</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                This asset satisfies all pre-publication brand governance checks.
              </span>
              <button
                onClick={() => {
                  setActiveReview(null);
                  setCurrentStep(1);
                }}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold cursor-pointer"
              >
                Start Another Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
