// Claim rules from marketing/brand-context.md, applied to every generated
// script and caption before anything is rendered or posted.

const RULES = [
  { re: /\binstant(ly)?\b|\bovernight\b|\bimmediate(ly)?\b/i, why: 'no instant results' },
  { re: /\bguarantee(d|s)?\b|\brisk[- ]free\b|\bmoney[- ]back\b|no questions asked/i, why: 'no guarantees' },
  { re: /\bcures?\b|\b100\s?%|\bfix(es)? it for good\b|\bpermanent(ly)? (fix|cure)/i, why: 'no outcome guarantees' },
  { re: /\beliminat(e|es|ed|ing)\b/i, why: 'say "helps" instead of "eliminates"' },
  { re: /\bkills? (weeds|pests|insects|bugs|fungus|grubs)\b|\bpesticide\b|\bherbicide\b|\binsecticide\b|\bfungicide\b/i, why: 'no pesticide or herbicide claims' },
  { re: /\bomri\b|\busda\b|\bcertified organic\b|\borganic certified\b/i, why: 'no certification claims' },
  { re: /\b(5|five)[- ]star\b|\bthousands of (happy )?customers\b|\bbest[- ]selling\b|\b#1\b/i, why: 'no invented reviews or rankings' },
];

const SAFETY = /\b(pet|kid|child|children|family|dog)[- ](safe|friendly)\b|\bsafe (for|around) (pets|kids|children|dogs|your family)\b/i;
const AS_DIRECTED = /when used as directed/i;

/** Returns a list of human-readable violations; empty means the text passes. */
export function findClaimViolations(text) {
  const value = String(text || '');
  const found = [];
  for (const rule of RULES) {
    const match = value.match(rule.re);
    if (match) found.push(`"${match[0]}" (${rule.why})`);
  }
  // Safety wording is allowed only with "when used as directed" in the same sentence.
  for (const sentence of value.split(/(?<=[.!?\n])\s*/)) {
    const match = sentence.match(SAFETY);
    if (match && !AS_DIRECTED.test(sentence)) found.push(`"${match[0]}" without "when used as directed"`);
  }
  return found;
}

export function collectScriptText(script) {
  const parts = [script.hook, ...(script.scenes || []).map((s) => s.text), script.endCard];
  const c = script.captions || {};
  parts.push(c.instagram, c.facebook, c.twitter, c.tiktok, c.youtubeTitle, c.youtubeDescription, c.pinterestTitle, c.pinterestDescription);
  return parts.filter(Boolean).join('\n');
}
