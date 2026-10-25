import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  PlusCircle,
  BookOpen,
  UserCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Review, BrandProfile, GovernanceInsightsData } from '../types';

interface DashboardProps {
  reviews: Review[];
  brands: BrandProfile[];
  insights: GovernanceInsightsData;
  onOpenReview: (reviewId: string) => void;
  onNewReview: () => void;
  onOpenBrands: () => void;
  onOpenApprovals: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reviews,
  brands,
  insights,
  onOpenReview,
  onNewReview,
  onOpenBrands,
  onOpenApprovals,
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReviews = reviews.filter((r) => {
    const matchesBrand = selectedBrandFilter === 'all' || r.brandId === selectedBrandFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.currentContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const pendingApprovalsCount = reviews.filter((r) => r.status === 'pending_approval').length;
  const revisionsNeededCount = reviews.filter((r) => r.status === 'revisions_needed').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const allFindings = reviews.flatMap((r) => r.findings);
  const criticalFindingsCount = allFindings.filter((f) => f.severity === 'critical' || f.severity === 'high').length;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time pre-publication compliance, active findings, and human approval queue metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNewReview}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Content</span>
          </button>

          <button
            onClick={onOpenApprovals}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Approvals ({pendingApprovalsCount})</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Reviews */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Reviews</span>
            <FileCheck2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{reviews.length}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14% mo
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Across {brands.length} active brand profiles</p>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-300">{pendingApprovalsCount}</span>
            <span className="text-[11px] font-semibold text-amber-400">Human Action</span>
          </div>
          <p className="text-[11px] text-slate-400">Awaiting approver sign-off</p>
        </div>

        {/* Critical & High Findings */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Critical Findings</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400">{criticalFindingsCount}</span>
            <span className="text-[11px] font-semibold text-rose-400">Unresolved</span>
          </div>
          <p className="text-[11px] text-slate-400">Claims violating SLAs or names</p>
        </div>

        {/* Revisions Needed */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Requiring Revision</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-300">{revisionsNeededCount}</span>
            <span className="text-[11px] text-slate-400">In draft rework</span>
          </div>
          <p className="text-[11px] text-slate-400">Suggested corrections available</p>
        </div>

        {/* Approved Content */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Approved to Publish</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{approvedCount}</span>
            <span className="text-[11px] font-semibold text-emerald-400">Version Locked</span>
          </div>
          <p className="text-[11px] text-slate-400">100% compliant with facts</p>
        </div>
      </div>

      {/* Middle Grid: Severity Distribution & Category Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Breakdown */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Findings Severity Distribution
            </h2>
            <span className="text-xs text-slate-400">Active Review Corpus</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                label: 'Critical Severity',
                count: allFindings.filter((f) => f.severity === 'critical').length,
                pct: '45%',
                color: 'bg-rose-500',
                desc: 'Fact contradictions, prohibited names, false SLA guarantees',
              },
              {
                label: 'High Severity',
                count: allFindings.filter((f) => f.severity === 'high').length,
                pct: '25%',
                color: 'bg-amber-500',
                desc: 'Unsupported superlatives, unverified clinical or market claims',
              },
              {
                label: 'Medium Severity',
                count: allFindings.filter((f) => f.severity === 'medium').length,
                pct: '20%',
                color: 'bg-indigo-500',
                desc: 'Tone violations, pushy CTAs, informal register',
              },
              {
                label: 'Low / Info',
                count: allFindings.filter((f) => f.severity === 'low').length,
                pct: '10%',
                color: 'bg-sky-500',
                desc: 'Visual contrast suggestions, verified fact citations',
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="text-slate-400 font-mono font-medium">{item.count} items</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                </div>
                <p className="text-[10px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Knowledge Links */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Common Policy & Governance Violations
              </h2>
              <button
                onClick={onOpenBrands}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <span>Manage Fact Library</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Fact Contradictions</span>
                <div className="text-xl font-bold text-rose-400">14</div>
                <p className="text-[10px] text-slate-500">e.g. 100% vs 99.9% SLA</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Prohibited Terms</span>
                <div className="text-xl font-bold text-amber-400">11</div>
                <p className="text-[10px] text-slate-500">Deprecated brand names</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Tone & Voice</span>
                <div className="text-xl font-bold text-indigo-400">8</div>
                <p className="text-[10px] text-slate-500">Aggressive sales language</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Visual & Contrast</span>
                <div className="text-xl font-bold text-sky-400">5</div>
                <p className="text-[10px] text-slate-500">Below 4.5:1 ratio</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Unsupported Claims</span>
                <div className="text-xl font-bold text-purple-400">7</div>
                <p className="text-[10px] text-slate-500">Missing benchmarks</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Compliance Rate</span>
                <div className="text-xl font-bold text-emerald-400">94.2%</div>
                <p className="text-[10px] text-slate-500">Post-revision average</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-slate-200">
                Indexed brand knowledge references: <strong>Acme Vault SLA Spec v4.2</strong> & Lumina Therapeutics
              </span>
            </div>
            <button
              onClick={onOpenBrands}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Inspect Sources
            </button>
          </div>
        </div>
      </div>

      {/* Review Activity Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Review Activity
            </h2>
            <p className="text-xs text-slate-400">
              Track submitted collateral, revision versions, and decision states.
            </p>
          </div>

          {/* Filters: Brand & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 w-full sm:w-44"
              />
            </div>

            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Title & Campaign</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Governance Status</th>
                <th className="py-2.5 px-3">Findings</th>
                <th className="py-2.5 px-3">Last Modified</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No reviews match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  const brand = brands.find((b) => b.id === rev.brandId);
                  const statusColors: Record<string, { label: string; bg: string; text: string }> = {
                    draft: { label: 'Draft', bg: 'bg-slate-800', text: 'text-slate-300' },
                    analyzing: { label: 'Analyzing', bg: 'bg-sky-500/20', text: 'text-sky-300' },
                    revisions_needed: { label: 'Revisions Needed', bg: 'bg-rose-500/20', text: 'text-rose-300' },
                    pending_approval: { label: 'Pending Approval', bg: 'bg-amber-500/20', text: 'text-amber-300' },
                    approved: { label: 'Approved', bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
                    rejected: { label: 'Rejected', bg: 'bg-rose-500/20', text: 'text-rose-400' },
                  };
                  const currentStatus = statusColors[rev.status] || statusColors.draft;
                  const critCount = rev.findings.filter((f) => f.severity === 'critical').length;

                  return (
                    <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{rev.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {rev.campaignName} • {rev.contentType}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-300">{brand?.name || 'Acme Vault'}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        v{rev.currentVersion}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus.bg} ${currentStatus.text}`}
                        >
                          {currentStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-300">{rev.findings.length} total</span>
                          {critCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                              {critCount} Crit
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{rev.updatedAt}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenReview(rev.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors cursor-pointer"
                        >
                          Review &amp; Revise
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
