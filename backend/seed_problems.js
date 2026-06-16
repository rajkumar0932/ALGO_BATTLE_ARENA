require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateAndSeed() {
  try {
    console.log("Migrating table...");
    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE problems 
      ADD COLUMN IF NOT EXISTS starter_code JSONB,
      ADD COLUMN IF NOT EXISTS test_cases JSONB
    `);

    // We will use 'starter_code' as a JSON map: { "javascript": "...", "python": "...", "c++": "...", "java": "..." }
    // We will use 'test_cases' as a JSON array: [ { input: "...", expectedOutput: "..." } ]

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
      "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
      "unsolved",
      JSON.stringify({
        javascript: "function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}"
      }),
      JSON.stringify([
        { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
        { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
        { input: "[3,3], 6", expectedOutput: "[0,1]" }
      ])
    ]);

    // Problem 2: Reverse String (Easy)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Reverse String",
      "easy",
      "Write a function that reverses a string. The input string is given as an array of characters s.",
      "unsolved",
      JSON.stringify({
        javascript: "function reverseString(s) {\n  // Write your code here\n  return s;\n}"
      }),
      JSON.stringify([
        { input: "['h','e','l','l','o']", expectedOutput: "['o','l','l','e','h']" },
        { input: "['H','a','n','n','a','h']", expectedOutput: "['h','a','n','n','a','H']" }
      ])
    ]);

    // Problem 3: Maximum Subarray (Medium)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Maximum Subarray",
      "medium",
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      "unsolved",
      JSON.stringify({
        javascript: "function maxSubArray(nums) {\n  // Write your code here\n  return 0;\n}"
      }),
      JSON.stringify([
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
        { input: "[1]", expectedOutput: "1" },
        { input: "[5,4,-1,7,8]", expectedOutput: "23" }
      ])
    ]);

    // Problem 4: Merge Intervals (Medium)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Merge Intervals",
      "medium",
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
      "unsolved",
      JSON.stringify({
        javascript: "function merge(intervals) {\n  // Write your code here\n  return intervals;\n}"
      }),
      JSON.stringify([
        { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
        { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" }
      ])
    ]);

    // Problem 5: Trapping Rain Water (Hard)
    await pool.query(`
      INSERT INTO problems (title, difficulty, statement, action, starter_code, test_cases)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      "Trapping Rain Water",
      "hard",
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      "unsolved",
      JSON.stringify({
        javascript: "function trap(height) {\n  // Write your code here\n  return 0;\n}"
      }),
      JSON.stringify([
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
        { input: "[4,2,0,3,2,5]", expectedOutput: "9" }
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
