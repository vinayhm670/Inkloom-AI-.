import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTrailProps {
  auditLog: AuditEvent[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ auditLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('all');

  const filteredLog = auditLog.filter((evt) => {
    const matchesAction = selectedActionFilter === 'all' || evt.action === selectedActionFilter;
    const matchesSearch =
      evt.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.reviewTitle && evt.reviewTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  const exportAuditLog = (format: 'json' | 'csv') => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `inkloom_audit_trail_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      content = JSON.stringify(filteredLog, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    } else {
      const header = 'ID,Timestamp,Action,Brand,User,Role,Details\n';
      const rows = filteredLog.map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.action}","${e.brandName}","${e.userName}","${e.userRole}","${e.details.replace(/"/g, '""')}"`
      );
      content = header + rows.join('\n');
      mimeType = 'text/csv';
      filename += '.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Immutable Governance Log
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              {filteredLog.length} Events
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Review History &amp; Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Traceable chronological event ledger recording all submissions, automated findings, human approvals, and rule updates.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportAuditLog('csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportAuditLog('json')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, brand, or details..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Action Types</option>
            <option value="CONTENT_SUBMITTED">Content Submitted</option>
            <option value="ANALYSIS_COMPLETED">Analysis Completed</option>
            <option value="REVISION_CREATED">Revision Created</option>
            <option value="CONTENT_APPROVED">Content Approved</option>
            <option value="CONTENT_REJECTED">Content Rejected</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="COMMENT_ADDED">Comment Added</option>
            <option value="BRAND_RULE_UPDATED">Brand Rule Updated</option>
            <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
          </select>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-6">
        {filteredLog.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No audit records found matching your filters.
          </div>
        ) : (
          filteredLog.map((event) => {
            const isApproval = event.action === 'CONTENT_APPROVED';
            const isRejection = event.action === 'CONTENT_REJECTED';
            const isRevision = event.action === 'REVISION_CREATED';
            const isAnalysis = event.action === 'ANALYSIS_COMPLETED';

            const dotColor = isApproval
              ? 'bg-emerald-400 border-emerald-500/40 ring-4 ring-emerald-500/10'
              : isRejection
              ? 'bg-rose-400 border-rose-500/40 ring-4 ring-rose-500/10'
              : isRevision
              ? 'bg-sky-400 border-sky-500/40 ring-4 ring-sky-500/10'
              : isAnalysis
              ? 'bg-indigo-400 border-indigo-500/40 ring-4 ring-indigo-500/10'
              : 'bg-slate-400 border-slate-500/40 ring-4 ring-slate-500/10';

            return (
              <div key={event.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${dotColor}`}
                />

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800">
                        {event.action}
                      </span>
                      <span className="font-semibold text-sky-400">{event.brandName}</span>
                      {event.reviewTitle && (
                        <span className="text-slate-400 hidden md:inline">
                          • &quot;{event.reviewTitle}&quot;
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{event.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{event.details}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>
                        Actor: <strong className="text-slate-300">{event.userName}</strong> (
                        {event.userRole})
                      </span>
                    </div>
                    <span className="font-mono text-slate-600 text-[10px]">{event.id}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
