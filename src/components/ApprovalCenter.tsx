import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Lock,
  FileText,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { Review, BrandProfile, UserRole } from '../types';
import { submitApproverDecision, addReviewComment } from '../services/api';

interface ApprovalCenterProps {
  reviews: Review[];
  brands: BrandProfile[];
  currentRole: UserRole;
  onUpdateReview: (review: Review) => void;
  onOpenReviewDetail: (reviewId: string) => void;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  reviews,
  brands,
  currentRole,
  onUpdateReview,
  onOpenReviewDetail,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeReviewModal, setActiveReviewModal] = useState<Review | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filtered = reviews.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleRecordDecision = async (
    review: Review,
    decision: 'approved' | 'rejected' | 'returned_for_revision'
  ) => {
    setIsSubmitting(true);
    try {
      const updated = await submitApproverDecision(review.id, {
        decision,
        approverName: currentRole === 'approver' ? 'Elena Rostova (Approver)' : 'Authorized Governance Lead',
        approverRole: currentRole,
        comments: decisionNotes || `Decision marked as ${decision}`,
      });
      onUpdateReview(updated);
      setActiveReviewModal(updated);
      setDecisionNotes('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Human Sign-Off Gate
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Role Authority: {currentRole.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Human Approval Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Version-locked authorization. The AI governance engine never publishes content automatically.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'pending_approval', label: 'Pending Sign-Off' },
            { id: 'approved', label: 'Approved' },
            { id: 'revisions_needed', label: 'Returned for Revision' },
            { id: 'rejected', label: 'Rejected' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === item.id
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Non-Publishing Banner Notice */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold block mb-0.5">
            Strict Governance Guarantee:
          </strong>
          Every approval is immutable and bound to a specific version number. If content is edited
          after approval, the earlier sign-off is automatically invalidated and a new review is required.
        </div>
      </div>

      {/* Approval Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            No reviews match the selected filter.
          </div>
        ) : (
          filtered.map((rev) => {
            const brand = brands.find((b) => b.id === rev.brandId) || brands[0];
            const isPending = rev.status === 'pending_approval';
            const isApproved = rev.status === 'approved';
            const isRejected = rev.status === 'rejected';

            return (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {brand.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-300'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {rev.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{rev.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {rev.campaignName} • Version v{rev.currentVersion}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 font-sans line-clamp-3 leading-relaxed">
                    &quot;{rev.currentContent}&quot;
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Active Findings: {rev.findings.length}</span>
                    <span>Updated: {rev.updatedAt}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReviewModal(rev)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-center"
                  >
                    Inspect &amp; Decide
                  </button>
                  <button
                    onClick={() => onOpenReviewDetail(rev.id)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                    title="Open in Reviewer"
                  >
                    Workflow →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Detail Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Approval Evaluation • Version v{activeReviewModal.currentVersion}
                </span>
                <h3 className="text-base font-bold text-white">{activeReviewModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveReviewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-400">Content for Publication:</span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-200 leading-relaxed text-xs">
                  &quot;{activeReviewModal.currentContent}&quot;
                </div>
              </div>

              {/* Version History Comparison */}
              {activeReviewModal.revisions.length > 1 && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-400">
                    Original Version v1 (Comparison Diff):
                  </span>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-400 text-xs">
                    &quot;{activeReviewModal.originalContent}&quot;
                  </div>
                </div>
              )}

              {/* Finding Resolution Status */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-400">
                  Governance Audit Findings ({activeReviewModal.findings.length}):
                </span>
                <div className="space-y-2">
                  {activeReviewModal.findings.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{f.problemDescription}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          {f.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recorded decision display if already made */}
              {activeReviewModal.approverDecision && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-1">
                  <div className="font-semibold text-emerald-400">
                    Decision: {activeReviewModal.approverDecision.decision.toUpperCase()} on Version{' '}
                    v{activeReviewModal.approverDecision.approvedVersion}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Signed by: {activeReviewModal.approverDecision.approverName} at{' '}
                    {activeReviewModal.approverDecision.timestamp}
                  </p>
                  {activeReviewModal.approverDecision.comments && (
                    <p className="italic text-slate-300">
                      &quot;{activeReviewModal.approverDecision.comments}&quot;
                    </p>
                  )}
                </div>
              )}

              {/* Approver Action Panel */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300 block">
                  Approver Justification / Signature Comment:
                </label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  rows={2}
                  placeholder="Mandatory reasoning or compliance notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveReviewModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRecordDecision(activeReviewModal, 'returned_for_revision')}
                  disabled={isSubmitting}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 cursor-pointer"
                >
                  Return for Revision
                </button>
                <button
                  onClick={() => handleRecordDecision(activeReviewModal, 'rejected')}
                  disabled={isSubmitting}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleRecordDecision(activeReviewModal, 'approved')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md"
                >
                  Approve Version v{activeReviewModal.currentVersion}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
