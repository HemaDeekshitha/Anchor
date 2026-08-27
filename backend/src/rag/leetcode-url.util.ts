export function normalizeLeetcodeUrl(value?: string | null): string | null {
  if (!value) return null;
  const repaired = value.trim().replace(/^httpshttps:\/\//i, 'https://');
  try {
    const parsed = new URL(repaired);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const match = parsed.pathname.match(/^\/problems\/([a-z0-9-]+)\/?$/i);
    if (parsed.protocol !== 'https:' || hostname !== 'leetcode.com' || !match) {
      return null;
    }
    return `https://leetcode.com/problems/${match[1].toLowerCase()}/`;
  } catch {
    return null;
  }
}

export const LEETCODE_CODE_ONLY_DESCRIPTION =
  'Submit only your code solution in any programming language. An explanation is not required. Evaluation checks correctness, edge cases, and whether the algorithm is optimal; if it is not optimal, the feedback will identify the optimal approach.';

const LEETCODE_TITLE_TOKENS: Record<string, string> = {
  bst: 'BST',
  ii: 'II',
  iii: 'III',
  iv: 'IV',
  k: 'K',
  n: 'N',
  '2sum': '2Sum',
  '3sum': '3Sum',
  '4sum': '4Sum',
};

const LEETCODE_LOWERCASE_WORDS = new Set([
  'a',
  'an',
  'and',
  'at',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
  'without',
]);

export function leetcodeTaskTitle(value?: string | null): string | null {
  const normalized = normalizeLeetcodeUrl(value);
  if (!normalized) return null;

  const slug = normalized.split('/problems/')[1].replace(/\/$/, '');
  const problemName = slug
    .split('-')
    .map((word, index) => {
      if (LEETCODE_TITLE_TOKENS[word]) return LEETCODE_TITLE_TOKENS[word];
      if (index > 0 && LEETCODE_LOWERCASE_WORDS.has(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(' ');

  return `Solve ${problemName}.`;
}
