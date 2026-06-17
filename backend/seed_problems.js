require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateAndSeed() {
  try {
    console.log("Migrating table...");
    await pool.query(`
      ALTER TABLE problems 
      ADD COLUMN IF NOT EXISTS starter_code JSONB,
      ADD COLUMN IF NOT EXISTS test_cases JSONB
    `);

    console.log("Clearing old data (to avoid conflicts during development)...");
    await pool.query(`DELETE FROM submissions`);
    await pool.query(`DELETE FROM matches`);
    await pool.query(`DELETE FROM problems`);

    console.log("Inserting new problems...");

    // Problem 1: Two Sum (Easy)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Two Sum",
      "easy",
      `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.

### Example 1:
**Input:** \`nums = [2,7,11,15], target = 9\`
**Output:** \`[0,1]\`
**Explanation:** Because \`nums[0] + nums[1] == 9\`, we return \`[0, 1]\`.

### Example 2:
**Input:** \`nums = [3,2,4], target = 6\`
**Output:** \`[1,2]\`
**Explanation:** Because \`nums[1] + nums[2] == 6\`, we return \`[1, 2]\`.

### Example 3:
**Input:** \`nums = [3,3], target = 6\`
**Output:** \`[0,1]\`
**Explanation:** Because \`nums[0] + nums[1] == 6\`, we return \`[0, 1]\`.`,
      "unsolved",
      JSON.stringify({
        javascript: "function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}"
      }),
      JSON.stringify([
        { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
        { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
        { input: "[3,3], 6", expectedOutput: "[0,1]" },
        { input: "[1,2,3,4,5], 9", expectedOutput: "[3,4]" },
        { input: "[-1,-2,-3,-4,-5], -8", expectedOutput: "[2,4]" },
        { input: "[0,4,3,0], 0", expectedOutput: "[0,3]" },
        { input: "[-10,7,19,15], 9", expectedOutput: "[0,2]" },
        { input: "[2,5,5,11], 10", expectedOutput: "[1,2]" },
        { input: "[10,20,30,40,50], 90", expectedOutput: "[3,4]" },
        { input: "[1,100,200,300], 400", expectedOutput: "[1,3]" }
      ])
    ]);

    // Problem 2: Reverse String (Easy)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Reverse String",
      "easy",
      `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with \`O(1)\` extra memory (for the purposes of this platform, returning the reversed array is also accepted).

### Example 1:
**Input:** \`s = ["h","e","l","l","o"]\`
**Output:** \`["o","l","l","e","h"]\`
**Explanation:** The characters are reversed from end to start.

### Example 2:
**Input:** \`s = ["H","a","n","n","a","h"]\`
**Output:** \`["h","a","n","n","a","H"]\`
**Explanation:** The characters are reversed from end to start, maintaining their original casing.`,
      "unsolved",
      JSON.stringify({
        javascript: "function reverseString(s) {\n  // Write your code here\n  return s;\n}"
      }),
      JSON.stringify([
        { input: "['h','e','l','l','o']", expectedOutput: "['o','l','l','e','h']" },
        { input: "['H','a','n','n','a','h']", expectedOutput: "['h','a','n','n','a','H']" },
        { input: "['a']", expectedOutput: "['a']" },
        { input: "['A',' ','m','a','n']", expectedOutput: "['n','a','m',' ','A']" },
        { input: "['1','2','3','4','5']", expectedOutput: "['5','4','3','2','1']" },
        { input: "['a','b','c','d']", expectedOutput: "['d','c','b','a']" },
        { input: "['!','@','#','$']", expectedOutput: "['$','#','@','!']" },
        { input: "['r','a','c','e','c','a','r']", expectedOutput: "['r','a','c','e','c','a','r']" },
        { input: "['x','y']", expectedOutput: "['y','x']" },
        { input: "['q','w','e','r','t','y']", expectedOutput: "['y','t','r','e','w','q']" }
      ])
    ]);

    // Problem 3: Maximum Subarray (Medium)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Maximum Subarray",
      "medium",
      `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return *its sum*.

A **subarray** is a contiguous non-empty sequence of elements within an array.

### Example 1:
**Input:** \`nums = [-2,1,-3,4,-1,2,1,-5,4]\`
**Output:** \`6\`
**Explanation:** The subarray \`[4,-1,2,1]\` has the largest sum \`6\`.

### Example 2:
**Input:** \`nums = [1]\`
**Output:** \`1\`
**Explanation:** The subarray \`[1]\` has the largest sum \`1\`.

### Example 3:
**Input:** \`nums = [5,4,-1,7,8]\`
**Output:** \`23\`
**Explanation:** The subarray \`[5,4,-1,7,8]\` has the largest sum \`23\`.`,
      "unsolved",
      JSON.stringify({
        javascript: "function maxSubArray(nums) {\n  // Write your code here\n  return 0;\n}"
      }),
      JSON.stringify([
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
        { input: "[1]", expectedOutput: "1" },
        { input: "[5,4,-1,7,8]", expectedOutput: "23" },
        { input: "[-1]", expectedOutput: "-1" },
        { input: "[-2,-1]", expectedOutput: "-1" },
        { input: "[1,2,-1,-2,2,1,-2,1,4,-5,4]", expectedOutput: "6" },
        { input: "[8,-19,5,-4,20]", expectedOutput: "21" },
        { input: "[0,0,0,0,0]", expectedOutput: "0" },
        { input: "[3,-2,5,-1]", expectedOutput: "6" },
        { input: "[-1,-2,-3,-4,-5]", expectedOutput: "-1" }
      ])
    ]);

    // Problem 4: Merge Intervals (Medium)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Merge Intervals",
      "medium",
      `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.

### Example 1:
**Input:** \`intervals = [[1,3],[2,6],[8,10],[15,18]]\`
**Output:** \`[[1,6],[8,10],[15,18]]\`
**Explanation:** Since intervals \`[1,3]\` and \`[2,6]\` overlap, merge them into \`[1,6]\`. The remaining intervals do not overlap.

### Example 2:
**Input:** \`intervals = [[1,4],[4,5]]\`
**Output:** \`[[1,5]]\`
**Explanation:** Intervals \`[1,4]\` and \`[4,5]\` are considered overlapping. Therefore, they are merged into \`[1,5]\`.`,
      "unsolved",
      JSON.stringify({
        javascript: "function merge(intervals) {\n  // Write your code here\n  return intervals;\n}"
      }),
      JSON.stringify([
        { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
        { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" },
        { input: "[[1,4],[0,4]]", expectedOutput: "[[0,4]]" },
        { input: "[[1,4],[0,1]]", expectedOutput: "[[0,4]]" },
        { input: "[[1,4],[2,3]]", expectedOutput: "[[1,4]]" },
        { input: "[[1,10],[2,3],[4,5],[6,7],[8,9]]", expectedOutput: "[[1,10]]" },
        { input: "[[1,2],[3,4],[5,6],[7,8]]", expectedOutput: "[[1,2],[3,4],[5,6],[7,8]]" },
        { input: "[[2,3],[4,5],[6,7],[8,9],[1,10]]", expectedOutput: "[[1,10]]" },
        { input: "[[1,4],[0,0]]", expectedOutput: "[[0,0],[1,4]]" },
        { input: "[[1,3],[2,6],[8,10],[9,18]]", expectedOutput: "[[1,6],[8,18]]" }
      ])
    ]);

    // Problem 5: Trapping Rain Water (Hard)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Trapping Rain Water",
      "hard",
      `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Example 1:
**Input:** \`height = [0,1,0,2,1,0,1,3,2,1,2,1]\`
**Output:** \`6\`
**Explanation:** The elevation map is represented by array \`[0,1,0,2,1,0,1,3,2,1,2,1]\`. In this case, 6 units of rain water are being trapped.

### Example 2:
**Input:** \`height = [4,2,0,3,2,5]\`
**Output:** \`9\`
**Explanation:** The map forms a basin between height 4 and 5, trapping water of depth 2, 4, 1, 2 respectively, which sums up to 9.`,
      "unsolved",
      JSON.stringify({
        javascript: "function trap(height) {\n  // Write your code here\n  return 0;\n}"
      }),
      JSON.stringify([
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
        { input: "[4,2,0,3,2,5]", expectedOutput: "9" },
        { input: "[0,0,0,0]", expectedOutput: "0" },
        { input: "[1,2,3,4,5]", expectedOutput: "0" },
        { input: "[5,4,3,2,1]", expectedOutput: "0" },
        { input: "[5,0,5]", expectedOutput: "5" },
        { input: "[4,2,3]", expectedOutput: "1" },
        { input: "[2,0,2]", expectedOutput: "2" },
        { input: "[3,0,0,2,0,4]", expectedOutput: "10" },
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1,0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "12" }
      ])
    ]);

    console.log("Migration and seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error migrating:", err);
    process.exit(1);
  }
}

migrateAndSeed();
