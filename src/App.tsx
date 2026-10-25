import React, { useState, useEffect } from 'react';
import {
  fetchBrands,
  fetchReviews,
  fetchAuditTrail,
  fetchAnalytics,
  createReview,
} from './services/api';
import {
  BrandProfile,
  Review,
  AuditEvent,
  GovernanceInsightsData,
  UserRole,
} from './types';
import {
  INITIAL_BRANDS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOG,
  INITIAL_INSIGHTS,
} from './data/initialData';
import { NeuralBackground } from './components/NeuralBackground';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReviewWorkflow } from './components/ReviewWorkflow';
import { BrandProfiles } from './components/BrandProfiles';
import { ApprovalCenter } from './components/ApprovalCenter';
import { AuditTrail } from './components/AuditTrail';
import { GovernanceInsights } from './components/GovernanceInsights';
import { CopilotModal } from './components/CopilotModal';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  // Theme management (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('inkloom_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('inkloom_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User Role Switcher ('admin' | 'creator' | 'reviewer' | 'approver')
  const [currentRole, setCurrentRole] = useState<UserRole>('creator');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Data states
  const [brands, setBrands] = useState<BrandProfile[]>(INITIAL_BRANDS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(INITIAL_AUDIT_LOG);
  const [insights, setInsights] = useState<GovernanceInsightsData>(INITIAL_INSIGHTS);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(
    INITIAL_REVIEWS[0]?.id || null
  );

  // Copilot modal state
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

  // Initial data loading from server
  useEffect(() => {
    async function loadData() {
      try {
        const [bData, rData, aData, iData] = await Promise.all([
          fetchBrands().catch(() => INITIAL_BRANDS),
          fetchReviews().catch(() => INITIAL_REVIEWS),
          fetchAuditTrail().catch(() => INITIAL_AUDIT_LOG),
          fetchAnalytics().catch(() => INITIAL_INSIGHTS),
        ]);
        if (bData && bData.length) setBrands(bData);
        if (rData && rData.length) setReviews(rData);
        if (aData && aData.length) setAuditLog(aData);
        if (iData) setInsights(iData);
      } catch (err) {
        console.error('Error fetching initial server data:', err);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleOpenReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setActiveTab('review');
  };

  const handleStartNewReview = (initialContent?: string) => {
    setSelectedReviewId(null);
    setActiveTab('review');
  };

  const handleSaveReview = (updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  const handleNewReviewSubmit = async (data: {
    brandId: string;
    title: string;
    campaignName: string;
    contentType: string;
    content: string;
  }): Promise<Review> => {
    const created = await createReview({
      ...data,
      authorName: currentRole === 'creator' ? 'Alex Mercer (Creator)' : 'User',
      authorRole: currentRole,
    });
    setReviews((prev) => [created, ...prev]);
    setSelectedReviewId(created.id);
    return created;
  };

  const handleOpenCopilotWithPrompt = (prompt?: string) => {
    if (prompt) setCopilotInitialPrompt(prompt);
    setCopilotOpen(true);
  };

  const pendingApprovalsCount = reviews.filter((r) => r.status === 'pending_approval').length;
  const currentReview = reviews.find((r) => r.id === selectedReviewId) || null;

  return (
    <div
      className={`min-h-screen relative font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Moving Neural Network Background (Canvas) */}
      <NeuralBackground theme={theme} />

      {/* Role Indicator Banner */}
      <div className="relative z-30 bg-slate-900/90 border-b border-slate-800 text-[11px] py-1 px-4 text-center text-slate-400 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          Viewing as <strong className="text-white capitalize">{currentRole}</strong> persona.
          Switch roles anytime in the navbar to test Creator, Reviewer, or Approver authority.
        </span>
      </div>

      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        theme={theme}
        toggleTheme={toggleTheme}
        openCopilot={() => handleOpenCopilotWithPrompt()}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Page Content View Router */}
      <main className="relative z-10 min-h-[calc(100vh-140px)]">
        {activeTab === 'overview' && (
          <LandingPage
            onStartReview={handleStartNewReview}
            onOpenDashboard={() => setActiveTab('dashboard')}
            onOpenCopilot={() => handleOpenCopilotWithPrompt()}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            reviews={reviews}
            brands={brands}
            insights={insights}
            onOpenReview={handleOpenReview}
            onNewReview={() => handleStartNewReview()}
            onOpenBrands={() => setActiveTab('brands')}
            onOpenApprovals={() => setActiveTab('approvals')}
          />
        )}

        {activeTab === 'review' && (
          <ReviewWorkflow
            review={currentReview}
            brands={brands}
            currentRole={currentRole}
            onSaveReview={handleSaveReview}
            onNewReviewSubmit={handleNewReviewSubmit}
            onGoToApprovals={() => setActiveTab('approvals')}
          />
        )}

        {activeTab === 'brands' && (
          <BrandProfiles
            brands={brands}
            currentRole={currentRole}
            onBrandCreated={(newBrand) => setBrands((prev) => [...prev, newBrand])}
            onDocumentAdded={(brandId, doc) => {
              setBrands((prev) =>
                prev.map((b) => (b.id === brandId ? { ...b, documents: [...b.documents, doc] } : b))
              );
            }}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenter
            reviews={reviews}
            brands={brands}
            currentRole={currentRole}
            onUpdateReview={handleSaveReview}
            onOpenReviewDetail={handleOpenReview}
          />
        )}

        {activeTab === 'audit' && <AuditTrail auditLog={auditLog} />}

        {activeTab === 'insights' && (
          <GovernanceInsights insights={insights} brands={brands} reviews={reviews} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">INKLOOM AI</span>
            <span>— Brand Governance Before Publication.</span>
          </div>

          <div className="text-center md:text-right space-y-0.5">
            <p className="text-[11px] text-slate-400">
              Check every claim. Protect every brand. Publish with confidence.
            </p>
            <p className="text-[10px] text-slate-500">
              Acme Vault is a clearly labeled fictional demonstration brand created for governance verification.
            </p>
          </div>
        </div>
      </footer>

      {/* INKLOOM AI Copilot Modal Drawer */}
      <CopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        brands={brands}
        initialPrompt={copilotInitialPrompt}
      />
    </div>
  );
}
