import {
  LEETCODE_CODE_ONLY_DESCRIPTION,
  leetcodeTaskTitle,
  normalizeLeetcodeUrl,
} from './leetcode-url.util';

describe('LeetCode task presentation', () => {
  it('normalizes valid LeetCode problem URLs', () => {
    expect(
      normalizeLeetcodeUrl('https://www.leetcode.com/problems/group-anagrams/'),
    ).toBe('https://leetcode.com/problems/group-anagrams/');
  });

  it.each([
    ['https://leetcode.com/problems/group-anagrams/', 'Solve Group Anagrams.'],
    [
      'https://leetcode.com/problems/merge-k-sorted-lists/',
      'Solve Merge K Sorted Lists.',
    ],
    [
      'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
      'Solve Kth Smallest Element in a BST.',
    ],
  ])('builds a direct code-only title for %s', (url, expected) => {
    expect(leetcodeTaskTitle(url)).toBe(expected);
  });

  it('states the code-only evaluation rule', () => {
    expect(LEETCODE_CODE_ONLY_DESCRIPTION).toContain(
      'code solution in any programming language',
    );
    expect(LEETCODE_CODE_ONLY_DESCRIPTION).toContain(
      'An explanation is not required',
    );
    expect(LEETCODE_CODE_ONLY_DESCRIPTION).toContain('optimal approach');
  });
});
