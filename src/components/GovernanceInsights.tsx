import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  PieChart,
  Calendar,
  Filter,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { GovernanceInsightsData, BrandProfile, Review } from '../types';

interface GovernanceInsightsProps {
  insights: GovernanceInsightsData;
  brands: BrandProfile[];
  reviews: Review[];
}

export const GovernanceInsights: React.FC<GovernanceInsightsProps> = ({
  insights,
  brands,
  reviews,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const totalReviews = reviews.length;
  const approved = reviews.filter((r) => r.status === 'approved').length;
  const pending = reviews.filter((r) => r.status === 'pending_approval').length;
  const allFindings = reviews.flatMap((r) => r.findings);
  const criticalCount = allFindings.filter((f) => f.severity === 'critical').length;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Governance Intelligence
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              Live Aggregated Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Governance Insights &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Statistical tracking of claim violations, review turnaround velocity, and brand policy health.
          </p>
        </div>

        {/* Filters: Brand & Date */}
        <div className="flex items-center gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Compliance Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{insights.complianceRate}%</div>
          <p className="text-[11px] text-slate-400">Post-revision approval success rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Turnaround Velocity</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400">{insights.avgTurnaroundHours} hrs</div>
          <p className="text-[11px] text-slate-400">Submission to final human sign-off</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Critical Violations Caught</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{criticalCount}</div>
          <p className="text-[11px] text-slate-400">SLA mismatches &amp; false claims prevented</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Corrective Iterations</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300">{insights.revisionsCount}</div>
          <p className="text-[11px] text-slate-400">Revisions generated before publication</p>
        </div>
      </div>

      {/* Main Charts: Violations by Category & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Visual */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Governance Violations by Category
            </h3>
            <span className="text-xs text-slate-400">Across All Submissions</span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { label: 'Factual Conflicts (e.g. SLA 100% vs 99.9%)', count: 14, max: 20, color: 'bg-rose-500' },
              { label: 'Deprecated & Prohibited Terminology', count: 11, max: 20, color: 'bg-amber-500' },
              { label: 'Tone of Voice & Aggressive Exclamations', count: 8, max: 20, color: 'bg-indigo-500' },
              { label: 'Unsupported Superlatives (#1 fastest)', count: 7, max: 20, color: 'bg-purple-500' },
              { label: 'Visual & Accessibility Contrast (4.5:1)', count: 5, max: 20, color: 'bg-sky-500' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{cat.label}</span>
                  <span className="font-mono font-bold text-slate-300">{cat.count}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${(cat.count / cat.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Governance Volume & Violation Drop Trend */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Weekly Volume &amp; Policy Health
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">-44% recurring errors</span>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-4 h-48 items-end">
            {[
              { week: 'Week 1', reviews: 14, violations: 9 },
              { week: 'Week 2', reviews: 18, violations: 11 },
              { week: 'Week 3', reviews: 22, violations: 8 },
              { week: 'Week 4', reviews: 24, violations: 5 },
            ].map((col) => (
              <div key={col.week} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  {/* Total Reviews bar */}
                  <div
                    className="w-5 bg-sky-500/80 rounded-t-lg transition-all"
                    style={{ height: `${(col.reviews / 24) * 100}%` }}
                    title={`${col.reviews} Reviews`}
                  />
                  {/* Violations bar */}
                  <div
                    className="w-5 bg-rose-500/80 rounded-t-lg transition-all"
                    style={{ height: `${(col.violations / 14) * 100}%` }}
                    title={`${col.violations} Violations`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{col.week}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded bg-sky-500" />
              <span>Reviews Submitted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Violations Flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
