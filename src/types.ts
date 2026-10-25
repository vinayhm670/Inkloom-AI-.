export type UserRole = 'admin' | 'creator' | 'reviewer' | 'approver';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type FindingCategory = 'fact' | 'terminology' | 'tone' | 'policy' | 'accessibility';

export type FindingStatus =
  | 'verified_against_source'
  | 'conflict_with_source'
  | 'evidence_not_found'
  | 'requires_human_review'
  | 'resolved'
  | 'dismissed';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  problemDescription: string;
  relevantText: string;
  explanation: string;
  evidenceSource?: string;
  applicableRule: string;
  suggestedCorrection: string;
  status: FindingStatus;
  confidence?: number;
}

export interface ApprovedFact {
  id: string;
  claim: string;
  source: string;
  verifiedDate: string;
}

export interface TerminologyRule {
  term: string;
  preferred: string;
  reason: string;
}

export interface BrandDocument {
  id: string;
  brandId: string;
  filename: string;
  fileSize: string;
  uploadTime: string;
  status: 'indexed' | 'processing' | 'failed';
  extractedContent: string;
  version: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  description: string;
  isDemo?: boolean;
  approvedProductNames: string[];
  prohibitedTerms: string[];
  preferredTerminology: TerminologyRule[];
  toneGuidelines: string[];
  approvedFacts: ApprovedFact[];
  claimsRequiringEvidence: string[];
  restrictedClaims: string[];
  visualGuidelines: {
    minContrast: number;
    primaryColor: string;
    secondaryColor: string;
  };
  documents: BrandDocument[];
}

export interface ContentRevision {
  version: number;
  content: string;
  timestamp: string;
  authorRole: UserRole;
  authorName: string;
  appliedCorrections: string[];
  changeNotes?: string;
}

export type ReviewStatus =
  | 'draft'
  | 'analyzing'
  | 'revisions_needed'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

export interface ApprovalDecision {
  decision: 'approved' | 'rejected' | 'returned_for_revision';
  approvedVersion: number;
  approverName: string;
  approverRole: string;
  timestamp: string;
  comments: string;
}

export interface ReviewComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  timestamp: string;
  message: string;
}

export interface Review {
  id: string;
  brandId: string;
  title: string;
  campaignName: string;
  contentType: string;
  originalContent: string;
  currentContent: string;
  currentVersion: number;
  revisions: ContentRevision[];
  findings: Finding[];
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  assignedApprover?: string;
  approverDecision?: ApprovalDecision;
  comments: ReviewComment[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  reviewId?: string;
  reviewTitle?: string;
  brandName: string;
  userRole: UserRole;
  userName: string;
  details: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  brandId?: string;
  sourcesCited?: string[];
  isError?: boolean;
}

export interface GovernanceInsightsData {
  totalReviews: number;
  pendingApprovals: number;
  criticalFindings: number;
  approvedContent: number;
  revisionsCount: number;
  complianceRate: number;
  avgTurnaroundHours: number;
  violationsByCategory: { category: FindingCategory; count: number }[];
  violationsBySeverity: { severity: Severity; count: number }[];
  recentTrends: { week: string; reviews: number; violations: number }[];
}
