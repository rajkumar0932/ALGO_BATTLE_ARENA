import { BattleVerdict } from "../socket/types";
import vm from "vm";

// Represents a test case structure
export interface TestCase {
  input: string; // The raw input string, e.g., "[2,7,11,15], 9"
  expectedOutput: string; // The JSON stringified expected output, e.g., "[0,1]"
}

// Hardcoded test cases for MVP. In a real system, fetch from PostgreSQL based on problemSlug
const problemDatabase: Record<string, { funcName: string; testCases: TestCase[] }> = {
  "two-sum": {
    funcName: "twoSum",
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" }
    ]
  }
};

/**
 * Evaluates the user's code against the hidden test cases using Node.js's built-in VM module.
 * This is incredibly fast and avoids relying on external rate-limited APIs!
 */
export async function evaluateSubmission(
  code: string,
  language: string,
  problemSlug: string
): Promise<{ verdict: BattleVerdict; passedCases: number; totalCases: number; executionTimeMs: number }> {
  
  const problem = problemDatabase[problemSlug];
  if (!problem) throw new Error(`Problem ${problemSlug} not found in database.`);

  const startTime = Date.now();

  if (language !== "javascript") {
    console.error("[Judge] We only support JavaScript right now!");
    return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs: 0 };
  }

  // Build the script string to execute
  let wrapper = `${code}\n\n`;
  
  problem.testCases.forEach((tc, index) => {
    wrapper += `const r${index} = ${problem.funcName}(${tc.input});\n`;
    wrapper += `if (JSON.stringify(r${index}) !== JSON.stringify(${tc.expectedOutput})) {\n`;
    wrapper += `  throw new Error("ASSERTION_ERROR: Test Case ${index + 1} Failed. Expected ${tc.expectedOutput} but got " + JSON.stringify(r${index}));\n`;
    wrapper += `}\n`;
  });

  try {
    // We execute the code in a completely fresh sandbox!
    // The timeout: 2000 ensures that if the user writes an infinite while(true) loop, it will automatically kill it!
    vm.runInNewContext(wrapper, { JSON, Math, Array, String, Number, Map, Set, Object }, { timeout: 2000 });
    
    const executionTimeMs = Date.now() - startTime;
    return { verdict: "ACCEPTED", passedCases: problem.testCases.length, totalCases: problem.testCases.length, executionTimeMs };

  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    
    if (err.message && err.message.includes("ASSERTION_ERROR:")) {
      console.log(`[Judge] ${err.message}`);
      return { verdict: "WRONG_ANSWER", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs };
    }
    
    // This catches infinite loops (ERR_SCRIPT_EXECUTION_TIMEOUT), Syntax Errors, and Reference Errors
    console.log("[Judge] Runtime/Syntax Error:", err.message);
    return { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs };
  }
}
