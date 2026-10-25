import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  FileText,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  FileCheck2,
  Upload,
  Lock,
  Eye,
  Info,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';
import { BrandProfile, BrandDocument, UserRole } from '../types';
import { uploadBrandDocument, createBrand } from '../services/api';

interface BrandProfilesProps {
  brands: BrandProfile[];
  currentRole: UserRole;
  onBrandCreated: (newBrand: BrandProfile) => void;
  onDocumentAdded: (brandId: string, doc: BrandDocument) => void;
}

export const BrandProfiles: React.FC<BrandProfilesProps> = ({
  brands,
  currentRole,
  onBrandCreated,
  onDocumentAdded,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    brands.find((b) => b.isDemo)?.id || brands[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'facts' | 'terminology' | 'tone' | 'docs' | 'visual'>(
    'facts'
  );

  // Document modal viewer
  const [viewingDoc, setViewingDoc] = useState<BrandDocument | null>(null);

  // New Brand modal
  const [createBrandModalOpen, setCreateBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');

  // Upload Doc state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadContent, setUploadContent] = useState('');

  const activeBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  const handleCreateBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      const created = await createBrand({
        name: newBrandName.trim(),
        description: newBrandDesc.trim(),
        approvedProductNames: [newBrandName.trim()],
        prohibitedTerms: ['untested', 'risk-free'],
        preferredTerminology: [],
        toneGuidelines: ['Professional, clear, authoritative, and fact-grounded.'],
        approvedFacts: [],
        claimsRequiringEvidence: ['market leader', '#1'],
        restrictedClaims: ['100% guarantee'],
        visualGuidelines: {
          minContrast: 4.5,
          primaryColor: '#0ea5e9',
          secondaryColor: '#10b981',
        },
      });
      onBrandCreated(created);
      setSelectedBrandId(created.id);
      setCreateBrandModalOpen(false);
      setNewBrandName('');
      setNewBrandDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename.trim() || !uploadContent.trim()) return;
    try {
      const doc = await uploadBrandDocument(activeBrand.id, {
        filename: uploadFilename.trim(),
        fileSize: `${(uploadContent.length / 1024).toFixed(1)} KB`,
        extractedContent: uploadContent.trim(),
      });
      onDocumentAdded(activeBrand.id, doc);
      setUploadModalOpen(false);
      setUploadFilename('');
      setUploadContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header & Brand Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Knowledge Repository
            </span>
            {activeBrand.isDemo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Fictional Demonstration Brand
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Brand Profiles &amp; Knowledge Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage company facts, approved terminology, SLA declarations, and indexed source documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Brand Selector Dropdown */}
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} {b.isDemo ? '(Demo)' : ''}
              </option>
            ))}
          </select>

          {currentRole === 'admin' && (
            <button
              onClick={() => setCreateBrandModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Brand</span>
            </button>
          )}
        </div>
      </div>

      {/* Brand Hero Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: activeBrand.visualGuidelines.primaryColor }}
            />
            <h2 className="text-xl font-bold text-white">{activeBrand.name}</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{activeBrand.description}</p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Primary: <strong className="text-slate-200">{activeBrand.approvedProductNames[0]}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Verified Facts: <strong className="text-slate-200">{activeBrand.approvedFacts.length}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Indexed Documents: <strong className="text-slate-200">{activeBrand.documents.length}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Target Contrast: <strong className="text-slate-200">{activeBrand.visualGuidelines.minContrast}:1</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Upload Knowledge Doc</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Facts, Terminology, Tone, Documents, Visual Guidelines */}
      <div className="border-b border-slate-800 flex items-center gap-4 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'facts', label: `Approved Facts (${activeBrand.approvedFacts.length})` },
          { id: 'terminology', label: `Terminology & Naming Rules` },
          { id: 'tone', label: 'Tone of Voice Guidelines' },
          { id: 'docs', label: `Knowledge Library (${activeBrand.documents.length})` },
          { id: 'visual', label: 'Visual & Accessibility Rules' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Approved Facts */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Verified Enterprise Facts
            </h3>
            <span className="text-xs text-slate-400">
              Referenced by Governance Engine and Copilot RAG
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBrand.approvedFacts.map((fact) => (
              <div
                key={fact.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Fact ID: {fact.id}
                  </span>
                  <span className="text-[11px] text-slate-500">Verified: {fact.verifiedDate}</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  &quot;{fact.claim}&quot;
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Source: {fact.source}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Terminology & Naming Rules */}
      {activeTab === 'terminology' && (
        <div className="space-y-6">
          {/* Preferred vs Prohibited Table */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Preferred Terminology Mappings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Prohibited / Deprecated Term</th>
                    <th className="py-2.5 px-3">Mandatory Preferred Term</th>
                    <th className="py-2.5 px-3">Governance Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeBrand.preferredTerminology.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3">
                        <span className="line-through text-rose-400 font-mono font-semibold">
                          {rule.term}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-semibold font-mono">
                          {rule.preferred}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{rule.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prohibited List & Claims Requiring Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                <span>Restricted &amp; Prohibited Absolute Claims</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeBrand.restrictedClaims.map((claim, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/20 border border-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>&quot;{claim}&quot;</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Claims Requiring Audited Third-Party Evidence</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeBrand.claimsRequiringEvidence.map((claim, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>&quot;{claim}&quot; (Requires benchmark report)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tone Guidelines */}
      {activeTab === 'tone' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Brand Tone &amp; Voice Directives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {activeBrand.toneGuidelines.map((guide, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-3"
              >
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold">
                  0{idx + 1}
                </span>
                <p>{guide}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Knowledge Library Documents */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Indexed Source Documents ({activeBrand.documents.length})
              </h3>
              <p className="text-xs text-slate-400">
                Primary factual grounding reference for AI audits and Copilot RAG queries.
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBrand.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{doc.filename}</h4>
                      <span className="text-[10px] text-slate-500">
                        {doc.fileSize} • Uploaded: {doc.uploadTime}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {doc.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 line-clamp-3">
                  {doc.extractedContent}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Version: {doc.version}</span>
                  <button
                    onClick={() => setViewingDoc(doc)}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Extracted Content</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Visual & Accessibility Rules */}
      {activeTab === 'visual' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Visual Identity &amp; WCAG Accessibility
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Minimum Text Contrast</span>
              <div className="text-2xl font-bold text-sky-400 font-mono">
                {activeBrand.visualGuidelines.minContrast}:1
              </div>
              <p className="text-[11px] text-slate-400">WCAG 2.1 AA Compliance for body text</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Primary Brand Color</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg border border-white/20"
                  style={{ backgroundColor: activeBrand.visualGuidelines.primaryColor }}
                />
                <span className="text-sm font-mono font-bold text-white">
                  {activeBrand.visualGuidelines.primaryColor}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Core identity color</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Secondary Accent</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg border border-white/20"
                  style={{ backgroundColor: activeBrand.visualGuidelines.secondaryColor }}
                />
                <span className="text-sm font-mono font-bold text-white">
                  {activeBrand.visualGuidelines.secondaryColor}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Highlight &amp; badge color</p>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{viewingDoc.filename}</h3>
                  <span className="text-[10px] text-slate-500">
                    Size: {viewingDoc.fileSize} • Uploaded: {viewingDoc.uploadTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {viewingDoc.extractedContent}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleUploadDocSubmit}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Upload Knowledge Document to {activeBrand.name}
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Document Filename:
                </label>
                <input
                  type="text"
                  required
                  value={uploadFilename}
                  onChange={(e) => setUploadFilename(e.target.value)}
                  placeholder="e.g. Acme_Security_Whitepaper_2026.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Extracted Document Text / Policy Content:
                </label>
                <textarea
                  required
                  rows={6}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste policies, SLA statements, approved facts, or naming guidelines..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 resize-none font-mono text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950"
              >
                Index &amp; Store Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create New Brand Modal */}
      {createBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateBrandSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create New Brand Profile</h3>
              <button
                type="button"
                onClick={() => setCreateBrandModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Brand Name:</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Apex Security"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description:</label>
                <textarea
                  rows={3}
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  placeholder="Brief description of the brand, market positioning, and industry..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateBrandModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950"
              >
                Create Brand
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
