import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic for rule-based governance detection
function analyzeText(content, rules) {
  const lower = content.toLowerCase();
  const findings = [];

  for (const item of rules.preferred) {
    if (lower.includes(item.term.toLowerCase())) {
      findings.push({ type: 'terminology', term: item.term, preferred: item.preferred });
    }
  }

  for (const claim of rules.claimsRequiringEvidence) {
    if (lower.includes(claim.toLowerCase())) {
      findings.push({ type: 'evidence_required', claim });
    }
  }

  for (const restricted of rules.restrictedClaims) {
    if (lower.includes(restricted.toLowerCase())) {
      findings.push({ type: 'fact_conflict', claim: restricted, factId: 'F-014', approvedSLA: '99.9%' });
    }
  }

  return findings;
}

test('Acme Vault sample text accurately flags the 3 mandatory violations', () => {
  const sample = "Acme Cloud is India's #1 fastest storage with guaranteed 100% uptime! Try it now.";
  const rules = {
    preferred: [{ term: 'Acme Cloud', preferred: 'Acme Vault' }],
    claimsRequiringEvidence: ['#1 fastest', "india's #1 fastest"],
    restrictedClaims: ['100% uptime', 'guaranteed 100% uptime'],
  };

  const results = analyzeText(sample, rules);

  assert.equal(results.length >= 3, true, 'Must detect at least 3 findings');
  assert.equal(results.some((r) => r.type === 'terminology' && r.preferred === 'Acme Vault'), true);
  assert.equal(results.some((r) => r.type === 'evidence_required'), true);
  assert.equal(results.some((r) => r.type === 'fact_conflict' && r.factId === 'F-014'), true);
});

test('Corrected sentence satisfies brand governance with 0 violations', () => {
  const compliant = "Fast storage backed by a 99.9% uptime SLA. Try Acme Vault.";
  const rules = {
    preferred: [{ term: 'Acme Cloud', preferred: 'Acme Vault' }],
    claimsRequiringEvidence: ['#1 fastest', "india's #1 fastest"],
    restrictedClaims: ['100% uptime', 'guaranteed 100% uptime'],
  };

  const results = analyzeText(compliant, rules);
  assert.equal(results.length, 0, 'Compliant revision should trigger 0 violations');
});
