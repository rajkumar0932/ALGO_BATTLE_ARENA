import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedProblem {
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  starterCode: string;
  testCases: { input: string; expected: string; isHidden: boolean; order: number }[];
}

const problems: SeedProblem[] = [
  // ─── 1. Two Sum (Easy) ─────────────────────────────────
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY",
    description: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Examples

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

## Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.`,
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
}

// Do not modify below this line
const input = JSON.parse(readline());
const result = twoSum(input.nums, input.target);
console.log(JSON.stringify(result));`,
    testCases: [
      { input: '{"nums":[2,7,11,15],"target":9}', expected: "[0,1]", isHidden: false, order: 0 },
      { input: '{"nums":[3,2,4],"target":6}', expected: "[1,2]", isHidden: false, order: 1 },
      { input: '{"nums":[3,3],"target":6}', expected: "[0,1]", isHidden: true, order: 2 },
      { input: '{"nums":[1,5,8,3,9],"target":12}', expected: "[1,4]", isHidden: true, order: 3 },
      { input: '{"nums":[-1,-2,-3,-4,-5],"target":-8}', expected: "[2,4]", isHidden: true, order: 4 },
    ],
  },

  // ─── 2. Valid Parentheses (Easy) ───────────────────────
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "EASY",
    description: `# Valid Parentheses

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Examples

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\`

## Constraints
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'\`.`,
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
}

// Do not modify below this line
const input = JSON.parse(readline());
console.log(JSON.stringify(isValid(input)));`,
    testCases: [
      { input: '"()"', expected: "true", isHidden: false, order: 0 },
      { input: '"()[]{}"', expected: "true", isHidden: false, order: 1 },
      { input: '"(]"', expected: "false", isHidden: true, order: 2 },
      { input: '"({[]})"', expected: "true", isHidden: true, order: 3 },
      { input: '"]"', expected: "false", isHidden: true, order: 4 },
    ],
  },

  // ─── 3. Longest Substring Without Repeating Characters (Medium) ──
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "MEDIUM",
    description: `# Longest Substring Without Repeating Characters

Given a string \`s\`, find the length of the **longest substring** without repeating characters.

## Examples

**Example 1:**
\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`

**Example 2:**
\`\`\`
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\`

**Example 3:**
\`\`\`
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
\`\`\`

## Constraints
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.`,
    starterCode: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution here
}

// Do not modify below this line
const input = JSON.parse(readline());
console.log(JSON.stringify(lengthOfLongestSubstring(input)));`,
    testCases: [
      { input: '"abcabcbb"', expected: "3", isHidden: false, order: 0 },
      { input: '"bbbbb"', expected: "1", isHidden: false, order: 1 },
      { input: '"pwwkew"', expected: "3", isHidden: true, order: 2 },
      { input: '""', expected: "0", isHidden: true, order: 3 },
      { input: '"abcdefghijklmnop"', expected: "16", isHidden: true, order: 4 },
    ],
  },

  // ─── 4. 3Sum (Medium) ─────────────────────────────────
  {
    title: "3Sum",
    slug: "three-sum",
    difficulty: "MEDIUM",
    description: `# 3Sum

Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

## Examples

**Example 1:**
\`\`\`
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation:
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum up to 0.
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [0,0,0]
Output: [[0,0,0]]
\`\`\`

## Constraints
- \`3 <= nums.length <= 3000\`
- \`-10^5 <= nums[i] <= 10^5\``,
    starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Write your solution here
}

// Do not modify below this line
const input = JSON.parse(readline());
const result = threeSum(input);
console.log(JSON.stringify(result));`,
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", expected: "[[-1,-1,2],[-1,0,1]]", isHidden: false, order: 0 },
      { input: "[0,1,1]", expected: "[]", isHidden: false, order: 1 },
      { input: "[0,0,0]", expected: "[[0,0,0]]", isHidden: true, order: 2 },
      { input: "[-2,0,1,1,2]", expected: "[[-2,0,2],[-2,1,1]]", isHidden: true, order: 3 },
      { input: "[1,-1,-1,0]", expected: "[[-1,0,1]]", isHidden: true, order: 4 },
    ],
  },

  // ─── 5. Merge K Sorted Lists (Hard) ────────────────────
  {
    title: "Merge K Sorted Lists",
    slug: "merge-k-sorted-lists",
    difficulty: "HARD",
    description: `# Merge K Sorted Lists

You are given an array of \`k\` sorted arrays. Merge all the arrays into one sorted array and return it.

## Examples

**Example 1:**
\`\`\`
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The arrays are merged and sorted.
\`\`\`

**Example 2:**
\`\`\`
Input: lists = []
Output: []
\`\`\`

**Example 3:**
\`\`\`
Input: lists = [[]]
Output: []
\`\`\`

## Constraints
- \`k == lists.length\`
- \`0 <= k <= 10^4\`
- \`0 <= lists[i].length <= 500\`
- \`-10^4 <= lists[i][j] <= 10^4\`
- Each \`lists[i]\` is sorted in ascending order.
- The sum of \`lists[i].length\` will not exceed \`10^4\`.`,
    starterCode: `/**
 * @param {number[][]} lists
 * @return {number[]}
 */
function mergeKSortedLists(lists) {
  // Write your solution here
}

// Do not modify below this line
const input = JSON.parse(readline());
const result = mergeKSortedLists(input);
console.log(JSON.stringify(result));`,
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", expected: "[1,1,2,3,4,4,5,6]", isHidden: false, order: 0 },
      { input: "[]", expected: "[]", isHidden: false, order: 1 },
      { input: "[[]]", expected: "[]", isHidden: true, order: 2 },
      { input: "[[1],[2],[3],[4],[5]]", expected: "[1,2,3,4,5]", isHidden: true, order: 3 },
      { input: "[[-5,-3,0],[- 2,1,4],[-1,2,3]]", expected: "[-5,-3,-2,-1,0,1,2,3,4]", isHidden: true, order: 4 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding AlgoBattle database...\n");

  // Clear existing data
  await prisma.submission.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problem.deleteMany();
  console.log("  ✓ Cleared existing data");

  // Seed problems with test cases
  for (const p of problems) {
    const problem = await prisma.problem.create({
      data: {
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        description: p.description,
        starterCode: p.starterCode,
        testCases: {
          create: p.testCases,
        },
      },
      include: { testCases: true },
    });

    const visible = problem.testCases.filter((t) => !t.isHidden).length;
    const hidden = problem.testCases.filter((t) => t.isHidden).length;
    console.log(
      `  ✓ ${problem.difficulty.padEnd(6)} | ${problem.title} (${visible} visible, ${hidden} hidden test cases)`
    );
  }

  console.log(`\n✅ Seeded ${problems.length} problems successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
