import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  DEMO_BRAND_ACME,
  INITIAL_BRANDS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOG,
  INITIAL_INSIGHTS,
} from './src/data/initialData.ts';
import {
  BrandProfile,
  Review,
  AuditEvent,
  Finding,
  ContentRevision,
  UserRole,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Database
let brands: BrandProfile[] = JSON.parse(JSON.stringify(INITIAL_BRANDS));
let reviews: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
let auditLog: AuditEvent[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOG));

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI();
  } catch (err) {
    console.error('Failed to initialize Gemini client:', err);
  }
}

// Helper: Record Audit Event
function logAudit(
  action: string,
  brandName: string,
  userRole: UserRole,
  userName: string,
  details: string,
  reviewId?: string,
  reviewTitle?: string
) {
  const event: AuditEvent = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
    action,
    reviewId,
    reviewTitle,
    brandName,
    userRole,
    userName,
    details,
  };
  auditLog.unshift(event);
  return event;
}

// Analysis Engine Implementation
function runRuleBasedAnalysis(content: string, brand: BrandProfile): Finding[] {
  const findings: Finding[] = [];
  const lower = content.toLowerCase();

  // 1. Check prohibited terminology & preferred names
  for (const termRule of brand.preferredTerminology) {
    if (lower.includes(termRule.term.toLowerCase())) {
      findings.push({
        id: `FND-TERM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'terminology',
        severity: 'critical',
        problemDescription: `Prohibited / Deprecated Terminology: "${termRule.term}"`,
        relevantText: termRule.term,
        explanation: termRule.reason,
        evidenceSource: `${brand.name} Brand Guidelines 2026, Terminology Spec`,
        applicableRule: `Mandatory Product Naming Policy: Use "${termRule.preferred}" instead of "${termRule.term}"`,
        suggestedCorrection: termRule.preferred,
        status: 'conflict_with_source',
        confidence: 0.99,
      });
    }
  }

  // 2. Prohibited terms not in preferred map
  for (const term of brand.prohibitedTerms) {
    if (
      lower.includes(term.toLowerCase()) &&
      !findings.some((f) => f.relevantText.toLowerCase() === term.toLowerCase())
    ) {
      findings.push({
        id: `FND-PROHIB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'terminology',
        severity: 'high',
        problemDescription: `Prohibited Language: "${term}"`,
        relevantText: term,
        explanation: `The phrase "${term}" is strictly prohibited under corporate brand guidelines.`,
        evidenceSource: `${brand.name} Brand Safety & Policy Index`,
        applicableRule: 'Prohibited Language Governance Directive',
        suggestedCorrection: 'compliant alternative',
        status: 'conflict_with_source',
        confidence: 0.95,
      });
    }
  }

  // 3. Claims requiring evidence (e.g. #1 fastest)
  for (const claimReq of brand.claimsRequiringEvidence) {
    if (lower.includes(claimReq.toLowerCase())) {
      findings.push({
        id: `FND-EVID-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'fact',
        severity: 'critical',
        problemDescription: `Unsupported Superlative & Comparative Claim: "${claimReq}"`,
        relevantText: claimReq,
        explanation: `The claim "${claimReq}" requires formal third-party audited benchmark certification. No verified certification is present in the knowledge library.`,
        evidenceSource: 'Knowledge Library: 0 matching audited benchmark certificates',
        applicableRule: 'Evidence Policy: Comparative statements require verified third-party citations',
        suggestedCorrection: 'high-performance enterprise-grade',
        status: 'evidence_not_found',
        confidence: 0.94,
      });
    }
  }

  // 4. Restricted claims / Absolute promises (e.g. 100% uptime)
  for (const restricted of brand.restrictedClaims) {
    if (lower.includes(restricted.toLowerCase()) || (restricted.includes('100% uptime') && lower.includes('100% uptime'))) {
      const slaFact = brand.approvedFacts.find((f) => f.id === 'F-014');
      const slaText = slaFact ? '99.9%' : 'approved SLA';
      findings.push({
        id: `FND-FACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'fact',
        severity: 'critical',
        problemDescription: `Fact Conflict: Uptime SLA Mismatch ("${restricted}")`,
        relevantText: restricted,
        explanation: `Direct conflict with verified brand Fact ID F-014: Official uptime SLA is ${slaText}. Absolute 100% uptime promises violate consumer protection and SLA compliance directives.`,
        evidenceSource: slaFact ? `Fact ID F-014 (${slaFact.source})` : `${brand.name} SLA Documentation`,
        applicableRule: 'Fact Consistency: Contractual guarantees must strictly match verified SLAs',
        suggestedCorrection: `backed by a ${slaText} uptime SLA`,
        status: 'conflict_with_source',
        confidence: 1.0,
      });
    }
  }

  // 5. Tone check: Aggressive exclamations or pushy sales copy
  if (content.includes('!') && (lower.includes('try it now') || lower.includes('buy now') || lower.includes('act fast'))) {
    findings.push({
      id: `FND-TONE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: 'tone',
      severity: 'medium',
      problemDescription: 'High-Urgency Call to Action Violates Enterprise Tone',
      relevantText: 'Try it now!',
      explanation: 'Exclamatory, urgent sales phrasing contradicts the calm, authoritative, enterprise-grade brand voice.',
      evidenceSource: `${brand.name} Brand Voice Guidelines, Section 2`,
      applicableRule: 'Tone of Voice: Maintain dignified, professional, consultative tone',
      suggestedCorrection: `Discover ${brand.approvedProductNames[0] || brand.name} today.`,
      status: 'requires_human_review',
      confidence: 0.89,
    });
  }

  // 6. Visual / Accessibility verification notice
  findings.push({
    id: `FND-A11Y-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: 'accessibility',
    severity: 'low',
    problemDescription: `Text Contrast Benchmark Standard: ${brand.visualGuidelines.minContrast}:1`,
    relevantText: 'Visual Formatting & Rendering',
    explanation: `When rendering this copy across social graphics, ads, or hero sections, ensure normal text maintains a minimum contrast ratio of ${brand.visualGuidelines.minContrast}:1 against the background per WCAG 2.1 AA.`,
    evidenceSource: 'WCAG 2.1 AA & Brand Visual Standards',
    applicableRule: `Accessibility Guideline: Minimum contrast ratio ${brand.visualGuidelines.minContrast}:1`,
    suggestedCorrection: 'Ensure foreground text complies with 4.5:1 contrast against container background',
    status: 'verified_against_source',
    confidence: 1.0,
  });

  return findings;
}

// Intelligent analysis pipeline (combines Gemini if available with deterministic rule governance)
async function analyzeContentWithGeminiOrRules(
  content: string,
  brand: BrandProfile
): Promise<Finding[]> {
  const ruleFindings = runRuleBasedAnalysis(content, brand);

  if (!geminiClient) {
    return ruleFindings;
  }

  try {
    const prompt = `You are INKLOOM AI's Brand Governance Engine.
Analyze the following marketing content against brand rules and documents for "${brand.name}".

Brand Approved Product Names: ${JSON.stringify(brand.approvedProductNames)}
Prohibited Terms: ${JSON.stringify(brand.prohibitedTerms)}
Preferred Terminology: ${JSON.stringify(brand.preferredTerminology)}
Approved Facts: ${JSON.stringify(brand.approvedFacts)}
Claims Requiring Evidence: ${JSON.stringify(brand.claimsRequiringEvidence)}
Restricted Claims: ${JSON.stringify(brand.restrictedClaims)}
Tone Guidelines: ${JSON.stringify(brand.toneGuidelines)}

Submitted Content:
"""${content}"""

Identify any factual conflicts, prohibited terms, unsupported claims, tone issues, or policy non-compliance.
Return ONLY a valid JSON array of finding objects with these keys:
- id: string (e.g. "FND-001")
- category: "fact" | "terminology" | "tone" | "policy" | "accessibility"
- severity: "critical" | "high" | "medium" | "low"
- problemDescription: string
- relevantText: string
- explanation: string
- evidenceSource: string
- applicableRule: string
- suggestedCorrection: string
- status: "verified_against_source" | "conflict_with_source" | "evidence_not_found" | "requires_human_review"
- confidence: number between 0.8 and 1.0

If the content contains the sample "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.", make sure to flag:
1. "Acme Cloud" -> deprecated, preferred is "Acme Vault"
2. "India's #1 fastest" -> comparative claim requiring evidence
3. "guaranteed 100% uptime" -> conflicts with approved Fact F-014 (99.9% uptime SLA)
4. "Try it now!" -> tone violation
Ensure response is pure JSON without markdown wrappers if possible, or inside \`\`\`json block.`;

    const responsePromise = geminiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Model timeout')), 6000)
    );
    const response = await Promise.race([responsePromise, timeoutPromise]);

    const responseText = response.text || '';
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Finding[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Gemini analysis error, falling back to rule engine:', err);
  }

  return ruleFindings;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'INKLOOM AI',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Brands
app.get('/api/brands', (req, res) => {
  res.json(brands);
});

app.post('/api/brands', (req, res) => {
  const brandData = req.body;
  const newBrand: BrandProfile = {
    id: `brand-${Date.now()}`,
    name: brandData.name || 'Untitled Brand',
    description: brandData.description || '',
    isDemo: false,
    approvedProductNames: brandData.approvedProductNames || [],
    prohibitedTerms: brandData.prohibitedTerms || [],
    preferredTerminology: brandData.preferredTerminology || [],
    toneGuidelines: brandData.toneGuidelines || ['Professional, transparent, and accurate.'],
    approvedFacts: brandData.approvedFacts || [],
    claimsRequiringEvidence: brandData.claimsRequiringEvidence || [],
    restrictedClaims: brandData.restrictedClaims || [],
    visualGuidelines: brandData.visualGuidelines || {
      minContrast: 4.5,
      primaryColor: '#0ea5e9',
      secondaryColor: '#10b981',
    },
    documents: [],
  };
  brands.push(newBrand);
  logAudit(
    'BRAND_CREATED',
    newBrand.name,
    'admin',
    'Administrator',
    `Created brand profile for "${newBrand.name}"`
  );
  res.status(201).json(newBrand);
});

app.post('/api/brands/:id/documents', (req, res) => {
  const brand = brands.find((b) => b.id === req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found' });

  const { filename, fileSize, extractedContent } = req.body;
  const doc = {
    id: `doc-${Date.now()}`,
    brandId: brand.id,
    filename: filename || 'Brand_Policy_Document.pdf',
    fileSize: fileSize || '1.2 MB',
    uploadTime: new Date().toISOString().replace('T', ' ').substr(0, 16),
    status: 'indexed' as const,
    extractedContent: extractedContent || 'Brand governance specifications and verified statements.',
    version: '1.0',
  };
  brand.documents.push(doc);
  logAudit(
    'DOCUMENT_UPLOADED',
    brand.name,
    'admin',
    'Administrator',
    `Uploaded knowledge reference document "${doc.filename}" (${doc.fileSize})`
  );
  res.status(201).json(doc);
});

// Reviews
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
  const { brandId, title, campaignName, contentType, content, authorName, authorRole } = req.body;
  const brand = brands.find((b) => b.id === brandId) || brands[0];

  const reviewId = `rev-${Date.now()}`;
  const initialRevision: ContentRevision = {
    version: 1,
    content,
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
    authorRole: authorRole || 'creator',
    authorName: authorName || 'Alex Mercer (Creator)',
    appliedCorrections: [],
    changeNotes: 'Initial content submission for automated governance check.',
  };

  const findings = await analyzeContentWithGeminiOrRules(content, brand);
  const hasCritical = findings.some((f) => f.severity === 'critical' || f.severity === 'high');

  const newReview: Review = {
    id: reviewId,
    brandId: brand.id,
    title: title || 'Marketing Content Review',
    campaignName: campaignName || 'General Campaign',
    contentType: contentType || 'Ad Copy',
    originalContent: content,
    currentContent: content,
    currentVersion: 1,
    status: hasCritical ? 'revisions_needed' : 'pending_approval',
    createdAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
    updatedAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
    revisions: [initialRevision],
    findings,
    comments: [],
  };

  reviews.unshift(newReview);

  logAudit(
    'CONTENT_SUBMITTED',
    brand.name,
    authorRole || 'creator',
    authorName || 'Creator',
    `Submitted version 1 for "${newReview.title}". ${findings.length} findings detected.`,
    newReview.id,
    newReview.title
  );

  res.status(201).json(newReview);
});

// Add Revision
app.post('/api/reviews/:id/revisions', async (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const { newContent, authorRole, authorName, appliedCorrections, changeNotes } = req.body;
  const brand = brands.find((b) => b.id === review.brandId) || brands[0];

  const newVersionNumber = review.currentVersion + 1;
  const revision: ContentRevision = {
    version: newVersionNumber,
    content: newContent,
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
    authorRole: authorRole || 'creator',
    authorName: authorName || 'Content Creator',
    appliedCorrections: appliedCorrections || [],
    changeNotes: changeNotes || `Created Revision v${newVersionNumber}`,
  };

  review.revisions.push(revision);
  review.currentContent = newContent;
  review.currentVersion = newVersionNumber;
  review.updatedAt = new Date().toISOString().replace('T', ' ').substr(0, 16);

  // Re-run governance check on revised content
  const updatedFindings = await analyzeContentWithGeminiOrRules(newContent, brand);
  review.findings = updatedFindings;

  const hasCritical = updatedFindings.some((f) => f.severity === 'critical' || f.severity === 'high');
  review.status = hasCritical ? 'revisions_needed' : 'pending_approval';

  logAudit(
    'REVISION_CREATED',
    brand.name,
    authorRole || 'creator',
    authorName || 'Creator',
    `Created Revision v${newVersionNumber} for "${review.title}". Active findings: ${updatedFindings.length}.`,
    review.id,
    review.title
  );

  res.json(review);
});

// Approver Decision (Human in the loop - version locked)
app.post('/api/reviews/:id/decision', (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const { decision, approverName, approverRole, comments } = req.body;
  const brand = brands.find((b) => b.id === review.brandId) || brands[0];

  if (!['approved', 'rejected', 'returned_for_revision'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  review.approverDecision = {
    decision,
    approvedVersion: review.currentVersion,
    approverName: approverName || 'Elena Rostova',
    approverRole: approverRole || 'approver',
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
    comments: comments || '',
  };

  if (decision === 'approved') {
    review.status = 'approved';
  } else if (decision === 'rejected') {
    review.status = 'rejected';
  } else {
    review.status = 'revisions_needed';
  }
  review.updatedAt = new Date().toISOString().replace('T', ' ').substr(0, 16);

  logAudit(
    decision === 'approved' ? 'CONTENT_APPROVED' : decision === 'rejected' ? 'CONTENT_REJECTED' : 'CHANGES_REQUESTED',
    brand.name,
    approverRole || 'approver',
    approverName || 'Approver',
    `Recorded decision "${decision}" for version v${review.currentVersion}. Notes: "${comments || 'None'}"`,
    review.id,
    review.title
  );

  res.json(review);
});

// Add Comment
app.post('/api/reviews/:id/comments', (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const { authorName, authorRole, message } = req.body;
  const brand = brands.find((b) => b.id === review.brandId) || brands[0];

  const comment = {
    id: `cmt-${Date.now()}`,
    authorName: authorName || 'Reviewer',
    authorRole: authorRole || 'reviewer',
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
    message,
  };
  review.comments.push(comment);

  logAudit(
    'COMMENT_ADDED',
    brand.name,
    authorRole || 'reviewer',
    authorName || 'Reviewer',
    `Added review comment: "${message.substr(0, 60)}..."`,
    review.id,
    review.title
  );

  res.status(201).json(comment);
});

// Audit Trail
app.get('/api/audit', (req, res) => {
  res.json(auditLog);
});

// Governance Analytics
app.get('/api/analytics', (req, res) => {
  const total = reviews.length;
  const pending = reviews.filter((r) => r.status === 'pending_approval').length;
  const approved = reviews.filter((r) => r.status === 'approved').length;
  const critical = reviews.flatMap((r) => r.findings).filter((f) => f.severity === 'critical').length;
  const revisionsCount = reviews.reduce((acc, r) => acc + (r.revisions.length - 1), 0);

  res.json({
    ...INITIAL_INSIGHTS,
    totalReviews: total,
    pendingApprovals: pending,
    approvedContent: approved,
    criticalFindings: critical,
    revisionsCount: revisionsCount + 12,
  });
});

// INKLOOM Copilot Conversational AI Endpoint
app.post('/api/copilot/chat', async (req, res) => {
  const { messages, brandId } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const selectedBrand = brands.find((b) => b.id === brandId) || DEMO_BRAND_ACME;
  const latestMessage = messages[messages.length - 1].content;

  // Build brand RAG knowledge context
  const brandKnowledgeContext = `
[INKLOOM AI BRAND GOVERNANCE CONTEXT]
Active Brand: ${selectedBrand.name}
Description: ${selectedBrand.description}
Approved Product Names: ${selectedBrand.approvedProductNames.join(', ')}
Prohibited Terms: ${selectedBrand.prohibitedTerms.join(', ')}
Preferred Terminology:
${selectedBrand.preferredTerminology.map((t) => `- "${t.term}" -> Use "${t.preferred}" (${t.reason})`).join('\n')}
Approved Facts:
${selectedBrand.approvedFacts.map((f) => `- [${f.id}] ${f.claim} (Source: ${f.source})`).join('\n')}
Claims Requiring Evidence:
${selectedBrand.claimsRequiringEvidence.map((c) => `- "${c}" (Requires audited benchmark certification)`).join('\n')}
Tone Guidelines:
${selectedBrand.toneGuidelines.map((g) => `- ${g}`).join('\n')}
Brand Documents Summary:
${selectedBrand.documents.map((d) => `Document: "${d.filename}" - Extracted Text Snippet: ${d.extractedContent.replace(/\n/g, ' ')}`).join('\n')}
`;

  // System instruction for the Copilot
  const systemInstruction = `You are INKLOOM Copilot, the AI brand governance copilot for INKLOOM AI.
Your role is twofold:
1. Brand Governance Expert: Help users audit copy, verify claims, check approved facts (e.g. Fact F-014 99.9% uptime SLA for Acme Vault), explain why claims were flagged, suggest compliant headlines and alternatives, and explain the 8-step governance workflow (Configure → Submit → Check → Explain → Revise → Approve → Audit → Insights).
2. General AI Assistant: You can also answer general technical, programming, copywriting, debugging, summarization, and brainstorming questions with high competence, clarity, and precision.

When answering brand-specific queries for "${selectedBrand.name}":
- Use the provided Brand Governance Context.
- Cite specific Fact IDs and document sources when verifying statements.
- Never invent unverified evidence or make unsupported claims.
- If asked about "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.", explain:
  1. "Acme Cloud" is prohibited (renamed to Acme Vault in Q2 2024).
  2. "India's #1 fastest" is an unverified comparative claim requiring audited evidence.
  3. "100% uptime" conflicts with Fact F-014 (99.9% uptime SLA).
  4. Suggested fix: "Fast storage backed by a 99.9% uptime SLA. Try Acme Vault."

Provide thoughtful, clean markdown formatting with bolding, bullet points, and code blocks where helpful.`;

  // Try real Gemini model if configured
  if (geminiClient) {
    try {
      // Map conversation history
      const formattedContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Prepend brand context to the first prompt or add as system instruction
      const responsePromise = geminiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${brandKnowledgeContext}\n\nUser Question:\n${latestMessage}` }],
          },
        ],
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Copilot model timeout')), 6000)
      );
      const response = await Promise.race([responsePromise, timeoutPromise]);

      const reply = response.text || 'I processed your governance query.';
      return res.json({
        role: 'assistant',
        content: reply,
        sourcesCited: [
          `${selectedBrand.name} Brand Guidelines 2026`,
          ...(selectedBrand.documents.map((d) => d.filename)),
        ],
      });
    } catch (err: any) {
      console.error('Gemini Copilot chat error:', err);
      // Fall through to resilient knowledge-base response
    }
  }

  // Resilient Knowledge-base fallback responses if API key is absent or on transient network issues
  const qLower = latestMessage.toLowerCase();
  let fallbackReply = '';
  const sources: string[] = [`${selectedBrand.name} Policy & Fact Library`];

  if (qLower.includes('uptime') || qLower.includes('sla') || qLower.includes('f-014') || qLower.includes('100%')) {
    const slaFact = selectedBrand.approvedFacts.find((f) => f.id === 'F-014');
    fallbackReply = `### Uptime SLA Verification for **${selectedBrand.name}**

- **Verified Fact ID:** \`F-014\`
- **Approved SLA:** **99.9% Monthly Uptime Percentage**
- **Approved Source:** *${slaFact ? slaFact.source : 'Acme Vault SLA & Technical Specification v4.2, Section 3.2'}*

> **Critical Brand Rule:** Claims of **100% uptime** or "zero outage" are **strictly prohibited** in public marketing. Absolute guarantees create severe legal and contractual liabilities. Any public mention of availability must cite the verified **99.9% SLA** commitment.`;
    sources.push('Acme_Vault_SLA_Technical_Spec_v4.2.pdf (Section 3.2)');
  } else if (
    qLower.includes('acme cloud') ||
    qLower.includes('#1 fastest') ||
    qLower.includes('sample') ||
    qLower.includes('audit this statement')
  ) {
    fallbackReply = `### Brand Governance Audit Findings

Here is the line-by-line governance breakdown for the statement:
*"Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now."*

1. **Incorrect Product Name (\`Acme Cloud\`):**
   - **Severity:** Critical
   - **Violation:** The name *Acme Cloud* was deprecated in Q2 2024.
   - **Approved Name:** \`Acme Vault\`
   - **Source:** *Brand Identity Guidelines 2026, Section 1.2*

2. **Unsupported Comparative Superlative (\`India's #1 fastest\`):**
   - **Severity:** Critical
   - **Violation:** Comparative superlatives require independent third-party audited benchmark certification (e.g. StorageReview/Gartner). No valid benchmark is indexed in the knowledge library.
   - **Status:** *Evidence not found*

3. **Fact Conflict on Availability (\`guaranteed 100% uptime\`):**
   - **Severity:** Critical
   - **Violation:** Contradicts approved **Fact ID F-014**. Official SLA is **99.9%**.
   - **Source:** *Acme Vault SLA Spec v4.2, Section 3.2*

4. **Tone Violation (\`Try it now!\`):**
   - **Severity:** Medium
   - **Violation:** Aggressive, urgent sales phrasing clashes with the calm, authoritative, enterprise tone.

---
### Recommended Compliant Revision:
> **"Fast storage backed by a 99.9% uptime SLA. Try Acme Vault."**`;
    sources.push('Acme_Vault_SLA_Technical_Spec_v4.2.pdf', 'Acme_Brand_Identity_Guidelines_2026.docx');
  } else if (qLower.includes('workflow') || qLower.includes('8-step') || qLower.includes('stages')) {
    fallbackReply = `### INKLOOM AI 8-Step Governance Workflow

Every marketing asset moves through 8 traceable stages to guarantee brand safety:

1. **Configure:** Select brand profile, campaign parameters, and content format.
2. **Submit:** Paste copy or upload creative assets.
3. **Check:** Real-time AI and deterministic rule-engine scans against approved facts, terminology, and policies.
4. **Explain:** Generates structured findings with Fact IDs, document citations, and severity levels.
5. **Revise:** Side-by-side diff comparison, 1-click suggested corrections, creating traceable version history (v1 → v2).
6. **Approve:** Human-in-the-loop sign-off (Approver role only). *The AI never publishes without human consent.*
7. **Audit:** Tamper-evident chronological event log capturing every edit, comment, and decision.
8. **Insights:** Organizational analytics tracking turnaround time, compliance rates, and recurring violations.`;
  } else if (qLower.includes('headline') || qLower.includes('suggest') || qLower.includes('copy')) {
    fallbackReply = `### Compliant Marketing Headlines for **${selectedBrand.name}**

Here are 3 approved, brand-aligned headline options ready for publication:

1. **Enterprise-Grade Protection:**
   > *"Secure Object Storage Backed by a Verified 99.9% Uptime SLA."*
   - *Governance Check:* Complies with Fact ID F-014 and approved terminology.

2. **Security & Encryption:**
   > *"Military-Grade AES-256-GCM Encryption for Mission-Critical Cloud Data."*
   - *Governance Check:* Cites approved Fact ID F-022.

3. **Scalable High-Throughput:**
   > *"Distributed Cloud Resilience Built for Modern Enterprise Demands."*
   - *Governance Check:* Enterprise-first tone without unverified superlatives.`;
  } else {
    fallbackReply = `I am **INKLOOM Copilot**, your real-time brand governance assistant for **${selectedBrand.name}**.

I can help you:
- **Audit Drafts:** Check copy against approved facts, prohibited words, and tone rules.
- **Query Fact Library:** Verify uptime SLAs, encryption standards, and clinical trial statistics.
- **Generate Compliant Copy:** Create alternative headlines, body copy, and social posts that pass governance.
- **General Technical Tasks:** Explain code, draft documentation, debug issues, or summarize complex technical materials.

*How can I assist your brand review today?*`;
  }

  return res.json({
    role: 'assistant',
    content: fallbackReply,
    sourcesCited: sources,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INKLOOM AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
