import { BrandProfile, Review, AuditEvent, GovernanceInsightsData } from '../types';

export const DEMO_BRAND_ACME: BrandProfile = {
  id: 'brand-acme-vault',
  name: 'Acme Vault',
  description: 'Enterprise encrypted cloud data protection and distributed secure object storage.',
  isDemo: true,
  approvedProductNames: ['Acme Vault', 'Acme Vault Enterprise', 'Vault KeyManager'],
  prohibitedTerms: ['Acme Cloud', 'Acme Locker', '100% unbreakable', 'zero latency'],
  preferredTerminology: [
    {
      term: 'Acme Cloud',
      preferred: 'Acme Vault',
      reason: 'Brand was officially renamed in Q2 2024. Acme Cloud is deprecated and confusing to customers.',
    },
    {
      term: 'unhackable',
      preferred: 'military-grade post-quantum encrypted',
      reason: 'Absolute claims like unhackable create compliance and legal liabilities.',
    },
    {
      term: 'cheap storage',
      preferred: 'cost-optimized high-durability storage',
      reason: 'Tone guideline: Reflect enterprise value rather than discount positioning.',
    },
  ],
  toneGuidelines: [
    'Authoritative, transparent, security-first, and technically precise.',
    'Never make exaggerated absolute promises (e.g. 100% uptime, unhackable).',
    'Back comparative claims with audited benchmarks.',
    'Maintain a calm, reliable, professional voice.',
  ],
  approvedFacts: [
    {
      id: 'F-014',
      claim: 'Uptime Service Level Agreement (SLA) is 99.9% across all enterprise multi-region clusters.',
      source: 'Acme Vault SLA & Technical Specification v4.2, Section 3.2',
      verifiedDate: '2026-01-15',
    },
    {
      id: 'F-022',
      claim: 'Data is protected with AES-256-GCM encryption at rest and TLS 1.3 in transit.',
      source: 'Security Whitepaper 2026, Section 1.4',
      verifiedDate: '2026-02-10',
    },
    {
      id: 'F-031',
      claim: 'Over 1,200 enterprise customers across finance, healthcare, and defence sectors.',
      source: 'Acme Investor Annual Report FY2025, Page 18',
      verifiedDate: '2026-03-01',
    },
  ],
  claimsRequiringEvidence: [
    '#1 fastest',
    'fastest storage in India',
    'industry-leading throughput',
    'lowest total cost of ownership',
  ],
  restrictedClaims: [
    '100% uptime guaranteed',
    'impenetrable security',
    'completely free migration with zero downtime',
  ],
  visualGuidelines: {
    minContrast: 4.5,
    primaryColor: '#0ea5e9',
    secondaryColor: '#10b981',
  },
  documents: [
    {
      id: 'doc-sla-v42',
      brandId: 'brand-acme-vault',
      filename: 'Acme_Vault_SLA_Technical_Spec_v4.2.pdf',
      fileSize: '1.4 MB',
      uploadTime: '2026-02-12 14:22',
      status: 'indexed',
      extractedContent: `Acme Vault Service Level Agreement (SLA) v4.2.
Section 3.2 Uptime Commitment:
Acme Vault provides a guaranteed 99.9% Monthly Uptime Percentage (Fact F-014).
If Acme Vault fails to meet the 99.9% uptime SLA, eligible customers receive SLA service credits.
Claims of 100% uptime are strictly prohibited in public communications as scheduled maintenance windows and network anomalies preclude 100.0% zero-outage guarantees.
Product Naming Directive: All corporate references must designate 'Acme Vault'. Legacy designation 'Acme Cloud' was decommissioned in May 2024.`,
      version: '4.2',
    },
    {
      id: 'doc-brand-guidelines',
      brandId: 'brand-acme-vault',
      filename: 'Acme_Brand_Identity_Guidelines_2026.docx',
      fileSize: '3.8 MB',
      uploadTime: '2026-02-18 09:40',
      status: 'indexed',
      extractedContent: `Acme Brand Identity & Marketing Guidelines 2026.
Rule 1.1: Comparative claims such as '#1 fastest' or 'market leader' require supporting evidence from audited benchmark reports (e.g. StorageReview or Gartner Peer Insights) cited directly in the collateral.
Rule 2.4: Accessibility standards mandate minimum 4.5:1 text contrast for body copy against solid or gradient backgrounds.
Tone: Confident, technically precise, enterprise-ready. Avoid hyperbolic hype or spammy calls-to-action like 'Try it now!!!'.`,
      version: '2026.1',
    },
  ],
};

export const INITIAL_BRANDS: BrandProfile[] = [
  DEMO_BRAND_ACME,
  {
    id: 'brand-lumina-health',
    name: 'Lumina Therapeutics',
    description: 'Precision genomic medicine and targeted oncology biopharmaceuticals.',
    isDemo: false,
    approvedProductNames: ['Lumina GeneGuard', 'OncoShield-X'],
    prohibitedTerms: ['cure for cancer', 'miracle drug', 'risk-free treatment'],
    preferredTerminology: [
      {
        term: 'miracle cure',
        preferred: 'targeted therapeutic pathway',
        reason: 'FDA & EMA compliance strictly forbids curative promises.',
      },
    ],
    toneGuidelines: [
      'Empathetic, scientifically rigorous, clinically validated, sober and optimistic.',
    ],
    approvedFacts: [
      {
        id: 'F-101',
        claim: 'Phase III clinical trials demonstrated a 68% progression-free survival rate over 24 months.',
        source: 'New England Journal of Medicine Publication 2025; 392:441-452',
        verifiedDate: '2025-11-20',
      },
    ],
    claimsRequiringEvidence: ['highest response rate', 'first-in-class efficacy'],
    restrictedClaims: ['100% cure', 'zero adverse effects'],
    visualGuidelines: {
      minContrast: 4.5,
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
    },
    documents: [
      {
        id: 'doc-clinical-summary',
        brandId: 'brand-lumina-health',
        filename: 'Lumina_Clinical_Regulatory_Summary.pdf',
        fileSize: '4.2 MB',
        uploadTime: '2026-01-10 11:15',
        status: 'indexed',
        extractedContent: `Regulatory Compliance Statement for Lumina Therapeutics.
All promotional claims must include FDA disclaimer and cite peer-reviewed Phase III trial statistics.
Curative statements are prohibited by Section 502 of the FD&C Act.`,
        version: '1.0',
      },
    ],
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-acme-sample-01',
    brandId: 'brand-acme-vault',
    title: 'Acme Vault Q4 Cloud Storage Launch Teaser',
    campaignName: 'Enterprise Security Sprint 2026',
    contentType: 'Social Ad Copy',
    originalContent: "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.",
    currentContent: "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.",
    currentVersion: 1,
    status: 'revisions_needed',
    createdAt: '2026-10-24 16:30',
    updatedAt: '2026-10-24 16:32',
    revisions: [
      {
        version: 1,
        content: "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.",
        timestamp: '2026-10-24 16:30',
        authorRole: 'creator',
        authorName: 'Alex Mercer (Copywriter)',
        appliedCorrections: [],
        changeNotes: 'Initial campaign copy drafted for LinkedIn & Twitter ads.',
      },
    ],
    findings: [
      {
        id: 'FND-001',
        category: 'terminology',
        severity: 'critical',
        problemDescription: 'Prohibited / Deprecated Product Name',
        relevantText: 'Acme Cloud',
        explanation: "The term 'Acme Cloud' was deprecated following the Q2 2024 corporate rebranding. The approved product name is 'Acme Vault'.",
        evidenceSource: 'Acme Brand Identity Guidelines 2026, Section 1.2',
        applicableRule: 'Mandatory Product Naming Policy',
        suggestedCorrection: 'Acme Vault',
        status: 'conflict_with_source',
        confidence: 0.99,
      },
      {
        id: 'FND-002',
        category: 'fact',
        severity: 'critical',
        problemDescription: 'Unsupported Superlative & Comparative Claim',
        relevantText: "India's #1 fastest",
        explanation: "The comparative claim '#1 fastest' requires documented third-party performance benchmarks (StorageReview / Gartner). No supporting evidence was found in the indexed library.",
        evidenceSource: 'Knowledge Library: 0 matching audited benchmark certificates',
        applicableRule: 'Evidence Policy: Comparative claims must cite audited sources',
        suggestedCorrection: 'high-performance enterprise-grade',
        status: 'evidence_not_found',
        confidence: 0.95,
      },
      {
        id: 'FND-003',
        category: 'fact',
        severity: 'critical',
        problemDescription: 'Fact Conflict: Uptime SLA Mismatch',
        relevantText: 'guaranteed 100% uptime',
        explanation: 'Direct contradiction with approved Fact ID F-014. The official verified uptime SLA is 99.9%. Absolute 100% uptime claims expose the organization to legal breach-of-contract penalties.',
        evidenceSource: 'Fact ID F-014 (Acme Vault SLA Spec v4.2, Section 3.2)',
        applicableRule: 'Fact Consistency: SLA claims must strictly reflect verified contracts',
        suggestedCorrection: 'backed by a 99.9% uptime SLA',
        status: 'conflict_with_source',
        confidence: 1.0,
      },
      {
        id: 'FND-004',
        category: 'tone',
        severity: 'medium',
        problemDescription: 'Aggressive Call-to-Action Tone Violation',
        relevantText: 'Try it now.',
        explanation: 'Exclamation and urgent phrasing conflicts with the authoritative, calm, security-first enterprise tone guideline.',
        evidenceSource: 'Acme Brand Guidelines, Tone & Voice Section',
        applicableRule: 'Tone of Voice: Professional and enterprise-focused',
        suggestedCorrection: 'Discover Acme Vault today.',
        status: 'requires_human_review',
        confidence: 0.88,
      },
    ],
    comments: [
      {
        id: 'cmt-1',
        authorName: 'Sarah Jenkins',
        authorRole: 'reviewer',
        timestamp: '2026-10-24 16:35',
        message: 'High legal risk on the 100% uptime claim. Please apply the 99.9% SLA correction before sending to the approver.',
      },
    ],
  },
  {
    id: 'rev-acme-sample-02',
    brandId: 'brand-acme-vault',
    title: 'Enterprise Encryption Whitepaper Summary',
    campaignName: 'Cybersecurity Month 2026',
    contentType: 'Landing Page Hero',
    originalContent: 'Acme Vault secures petabytes of data with AES-256-GCM encryption and 99.9% SLA uptime across multi-region clusters.',
    currentContent: 'Acme Vault secures petabytes of data with AES-256-GCM encryption and 99.9% SLA uptime across multi-region clusters.',
    currentVersion: 1,
    status: 'pending_approval',
    createdAt: '2026-10-24 14:10',
    updatedAt: '2026-10-24 15:00',
    revisions: [
      {
        version: 1,
        content: 'Acme Vault secures petabytes of data with AES-256-GCM encryption and 99.9% SLA uptime across multi-region clusters.',
        timestamp: '2026-10-24 14:10',
        authorRole: 'creator',
        authorName: 'Alex Mercer',
        appliedCorrections: [],
      },
    ],
    findings: [
      {
        id: 'FND-101',
        category: 'fact',
        severity: 'low',
        problemDescription: 'Fact Verified Against Knowledge Base',
        relevantText: 'AES-256-GCM encryption and 99.9% SLA uptime',
        explanation: 'Both claims match verified Fact IDs F-014 and F-022 in the Acme Vault Knowledge Library.',
        evidenceSource: 'Fact ID F-014, Fact ID F-022',
        applicableRule: 'Fact Consistency',
        suggestedCorrection: 'No correction needed',
        status: 'verified_against_source',
        confidence: 0.99,
      },
    ],
    comments: [],
    assignedApprover: 'Elena Rostova (VP Brand Governance)',
  },
];

export const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-24 16:35:22',
    action: 'COMMENT_ADDED',
    reviewId: 'rev-acme-sample-01',
    reviewTitle: 'Acme Vault Q4 Cloud Storage Launch Teaser',
    brandName: 'Acme Vault',
    userRole: 'reviewer',
    userName: 'Sarah Jenkins',
    details: 'Added review note regarding SLA 99.9% requirement.',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-24 16:32:04',
    action: 'ANALYSIS_COMPLETED',
    reviewId: 'rev-acme-sample-01',
    reviewTitle: 'Acme Vault Q4 Cloud Storage Launch Teaser',
    brandName: 'Acme Vault',
    userRole: 'creator',
    userName: 'Alex Mercer',
    details: 'AI Governance Engine detected 4 findings (3 Critical, 1 Medium). Status set to revisions_needed.',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-24 16:30:15',
    action: 'CONTENT_SUBMITTED',
    reviewId: 'rev-acme-sample-01',
    reviewTitle: 'Acme Vault Q4 Cloud Storage Launch Teaser',
    brandName: 'Acme Vault',
    userRole: 'creator',
    userName: 'Alex Mercer',
    details: 'Submitted version 1 for automated governance inspection.',
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-24 15:00:10',
    action: 'SUBMITTED_FOR_APPROVAL',
    reviewId: 'rev-acme-sample-02',
    reviewTitle: 'Enterprise Encryption Whitepaper Summary',
    brandName: 'Acme Vault',
    userRole: 'creator',
    userName: 'Alex Mercer',
    details: 'Submitted version 1 to Elena Rostova (Approver) with 1 verified finding.',
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-24 11:20:00',
    action: 'BRAND_RULE_UPDATED',
    brandName: 'Acme Vault',
    userRole: 'admin',
    userName: 'System Administrator',
    details: "Enforced Fact F-014 (99.9% SLA) and deprecated 'Acme Cloud' naming rule.",
  },
];

export const INITIAL_INSIGHTS: GovernanceInsightsData = {
  totalReviews: 24,
  pendingApprovals: 3,
  criticalFindings: 7,
  approvedContent: 18,
  revisionsCount: 31,
  complianceRate: 94.2,
  avgTurnaroundHours: 3.4,
  violationsByCategory: [
    { category: 'fact', count: 14 },
    { category: 'terminology', count: 11 },
    { category: 'tone', count: 8 },
    { category: 'accessibility', count: 5 },
    { category: 'policy', count: 3 },
  ],
  violationsBySeverity: [
    { severity: 'critical', count: 7 },
    { severity: 'high', count: 12 },
    { severity: 'medium', count: 15 },
    { severity: 'low', count: 9 },
  ],
  recentTrends: [
    { week: 'W1', reviews: 4, violations: 9 },
    { week: 'W2', reviews: 6, violations: 11 },
    { week: 'W3', reviews: 7, violations: 8 },
    { week: 'W4', reviews: 7, violations: 5 },
  ],
};
