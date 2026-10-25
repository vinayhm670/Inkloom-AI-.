import {
  BrandProfile,
  Review,
  AuditEvent,
  Finding,
  GovernanceInsightsData,
  UserRole,
} from '../types';

export async function fetchHealth(): Promise<{ status: string; appName: string; aiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', appName: 'INKLOOM AI', aiConfigured: false };
  }
}

export async function fetchBrands(): Promise<BrandProfile[]> {
  const res = await fetch('/api/brands');
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

export async function createBrand(brandData: Partial<BrandProfile>): Promise<BrandProfile> {
  const res = await fetch('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brandData),
  });
  if (!res.ok) throw new Error('Failed to create brand');
  return res.json();
}

export async function uploadBrandDocument(
  brandId: string,
  doc: { filename: string; fileSize: string; extractedContent: string }
) {
  const res = await fetch(`/api/brands/${brandId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export async function fetchReviews(): Promise<Review[]> {
  const res = await fetch('/api/reviews');
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function createReview(data: {
  brandId: string;
  title: string;
  campaignName: string;
  contentType: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
}): Promise<Review> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

export async function createRevision(
  reviewId: string,
  data: {
    newContent: string;
    authorRole: UserRole;
    authorName: string;
    appliedCorrections?: string[];
    changeNotes?: string;
  }
): Promise<Review> {
  const res = await fetch(`/api/reviews/${reviewId}/revisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save revision');
  return res.json();
}

export async function submitApproverDecision(
  reviewId: string,
  data: {
    decision: 'approved' | 'rejected' | 'returned_for_revision';
    approverName: string;
    approverRole: string;
    comments: string;
  }
): Promise<Review> {
  const res = await fetch(`/api/reviews/${reviewId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit decision');
  return res.json();
}

export async function addReviewComment(
  reviewId: string,
  data: { authorName: string; authorRole: UserRole; message: string }
) {
  const res = await fetch(`/api/reviews/${reviewId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

export async function fetchAuditTrail(): Promise<AuditEvent[]> {
  const res = await fetch('/api/audit');
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
}

export async function fetchAnalytics(): Promise<GovernanceInsightsData> {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function sendCopilotMessage(
  messages: { role: 'user' | 'assistant'; content: string }[],
  brandId?: string
): Promise<{ role: 'assistant'; content: string; sourcesCited?: string[] }> {
  const res = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, brandId }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Copilot service error');
  }
  return res.json();
}
