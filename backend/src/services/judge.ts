import { BattleVerdict } from "../socket/types";
import { pool } from "../config/db";

// Represents a test case structure
export interface TestCase {
  input: string; // The raw input string, e.g., "[2,7,11,15], 9"
  expectedOutput: string; // The JSON stringified expected output, e.g., "[0,1]"
}

/**
 * Builds the JS wrapper code that executes the user's function against the test cases.
 */
function buildJavascriptWrapper(userCode: string, funcName: string, testCases: TestCase[]): string {
  let wrapper = `${userCode}\n\n`;
  wrapper += `// --- HIDDEN TEST CASES START ---\n`;
  wrapper += `try {\n`;

  testCases.forEach((tc, index) => {
    wrapper += `  const result${index + 1} = ${funcName}(${tc.input});\n`;
    wrapper += `  if (JSON.stringify(result${index + 1}) !== JSON.stringify(${tc.expectedOutput})) {\n`;
    wrapper += `    throw new Error("Test Case ${index + 1} Failed. Expected ${tc.expectedOutput} but got " + JSON.stringify(result${index + 1}));\n`;
    wrapper += `  }\n`;
  });

  wrapper += `  console.log("ALL_CASES_PASSED");\n`;
  wrapper += `} catch (err) {\n`;
  wrapper += `  console.log("ASSERTION_ERROR: " + err.message);\n`;
  wrapper += `}\n`;

  return wrapper;
}

export interface JudgeResult {
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
  executionTimeMs: number;
}

/**
 * Evaluates the user's code using the public Piston API.
 */
export async function evaluateSubmission(
  code: string,
  language: string,
  problemId: string
): Promise<JudgeResult> {
  // Only JS supported for MVP wrapper logic
  if (language !== "javascript") {
    return { verdict: "COMPILATION_ERROR", passedCases: 0, totalCases: 0, executionTimeMs: 0 };
  }

  let testCases: TestCase[] = [];
  let funcName = "solve";

  try {
      const res = await pool.query(`SELECT test_cases, starter_code FROM problems WHERE id = $1`, [problemId]);
      if (res.rows.length === 0) {
          return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: 0, executionTimeMs: 0 };
      }
      testCases = res.rows[0].test_cases;
      
      // Extract function name from JS starter code (e.g. "function twoSum(nums..." -> "twoSum")
      const starterCode = res.rows[0].starter_code?.javascript;
      if (starterCode) {
          const match = starterCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
          if (match && match[1]) {
              funcName = match[1];
          }
      }
  } catch (err) {
      console.error("DB Error fetching test cases:", err);
      return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: 0, executionTimeMs: 0 };
  }

  if (!testCases || testCases.length === 0) {
      return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: 0, executionTimeMs: 0 };
  }

  const wrappedCode = buildJavascriptWrapper(code, funcName, testCases);

  try {
    const startTime = Date.now();

    // Use local Piston container if env var is set, otherwise fallback to public API
    const pistonEndpoint = process.env.PISTON_URL ? `${process.env.PISTON_URL}/api/v2/execute` : "https://emkc.org/api/v2/piston/execute";
    
    // Call the Piston API
    const response = await fetch(pistonEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        version: "*", // Use wildcard so Piston auto-selects the installed version
        files: [{ name: "main.js", content: wrappedCode }]
      })
    });

    const data = await response.json();
    const executionTimeMs = Date.now() - startTime; // Rough estimate of network + execution

    if (!response.ok || !data.run) {
      console.error("[Judge] API Error:", data);
      return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: testCases.length, executionTimeMs };
    }

    const output = data.run.stdout as string;
    const error = data.run.stderr as string;

    // Check for runtime crash/syntax errors
    if (error && error.trim().length > 0) {
      console.log("[Judge] Stderr:", error);
      return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: testCases.length, executionTimeMs };
    }

    // Check for our custom assertion markers
    if (output.includes("ALL_CASES_PASSED")) {
      return { verdict: "ACCEPTED", passedCases: testCases.length, totalCases: testCases.length, executionTimeMs };
    } else if (output.includes("ASSERTION_ERROR:")) {
      console.log("[Judge] Failed Assertions:", output.trim());
      // For MVP, if it fails, we assume 0 passed (or we could parse exactly which case failed)
      return { verdict: "WRONG_ANSWER", passedCases: 0, totalCases: testCases.length, executionTimeMs };
    } else {
      // Something unexpected was printed, or the function didn't return
      console.log("[Judge] Unexpected Output:", output.trim());
      return { verdict: "WRONG_ANSWER", passedCases: 0, totalCases: testCases.length, executionTimeMs };
    }

  } catch (err) {
    console.error("[Judge] Fetch Error:", err);
    return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: testCases.length, executionTimeMs: 0 };
  }
}
