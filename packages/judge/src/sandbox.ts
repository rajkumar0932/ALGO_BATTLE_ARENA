import { VM } from "vm2";
import type { SandboxResult } from "@algobattle/types";

/**
 * Executes user code in a highly restricted vm2 sandbox.
 * NOTE: vm2 is deprecated, but used here as per requirements for MVP.
 */
export async function executeSandbox(
  code: string,
  input: string,
  timeLimitMs: number = 2000
): Promise<SandboxResult> {
  const startTime = Date.now();
  let timedOut = false;
  
  // Prepare code that provides the input via a readline mock and catches console.log
  const wrappedCode = `
    let __sandbox_output__ = [];
    const console = {
      log: (...args) => {
        __sandbox_output__.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      }
    };
    
    let __input_consumed__ = false;
    const readline = () => {
      if (__input_consumed__) return null;
      __input_consumed__ = true;
      return __INPUT__;
    };
    
    // Execute user code
    ${code}
    
    // Return captured output
    __sandbox_output__.join('\\n');
  `;

  try {
    const vm = new VM({
      timeout: timeLimitMs,
      sandbox: {
        __INPUT__: input
      },
      eval: false,
      wasm: false,
      fixAsync: true
    });

    const output = await vm.run(wrappedCode);
    
    return {
      output: normalizeOutput(typeof output === 'string' ? output : String(output || "")),
      executionTimeMs: Date.now() - startTime,
      timedOut: false
    };
  } catch (error: any) {
    if (error.message === 'Script execution timed out.') {
      timedOut = true;
    }
    
    return {
      output: "",
      executionTimeMs: Date.now() - startTime,
      error: error.message || String(error),
      timedOut
    };
  }
}

// ─── Piston Execution ────────────────────────────────────

/** Normalizes output for fair comparison across languages */
export function normalizeOutput(output: string): string {
  return output
    .trim()
    .replace(/\r\n/g, '\n')  // Windows line endings
    .replace(/\s+$/gm, '')   // trailing whitespace per line
    .toLowerCase();          // true vs True vs TRUE
}

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: "node", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  "c++": { language: "c++", version: "10.2.0" },
};

/** Executes code using the public Piston API with retry logic */
export async function executePiston(
  code: string,
  input: string,
  language: string,
  timeLimitMs: number = 2000
): Promise<SandboxResult> {
  const startTime = Date.now();
  const langConfig = LANGUAGE_MAP[language.toLowerCase()] || LANGUAGE_MAP["javascript"];

  const payload = {
    language: langConfig.language,
    version: langConfig.version,
    files: [{ content: code }],
    stdin: input,
    compile_timeout: 10000,
    run_timeout: timeLimitMs,
  };

  // Exponential backoff for rate limits
  let attempts = 0;
  const maxAttempts = 3;
  let response;

  while (attempts < maxAttempts) {
    try {
      response = await fetch(PISTON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        attempts++;
        if (attempts >= maxAttempts) throw new Error("Piston rate limit exceeded");
        await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Piston error: ${response.statusText}`);
      }

      break;
    } catch (e: any) {
      attempts++;
      if (attempts >= maxAttempts) {
        return {
          output: "",
          executionTimeMs: Date.now() - startTime,
          error: "Piston API Error: " + (e.message || String(e)),
          timedOut: false
        };
      }
      await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000));
    }
  }

  const result = (await response!.json()) as any;
  const executionTimeMs = Date.now() - startTime;

  // Check compile error first
  if (result.compile && result.compile.code !== 0) {
    return {
      output: "",
      executionTimeMs,
      error: "COMPILE_ERROR:" + (result.compile.stderr || result.compile.output),
      timedOut: false
    };
  }

  const run = result.run;
  if (!run) {
    return {
      output: "",
      executionTimeMs,
      error: "Unknown execution error",
      timedOut: false
    };
  }

  if (run.signal === "SIGKILL" || run.signal === "SIGXCPU") {
    return {
      output: "",
      executionTimeMs,
      error: "Time Limit Exceeded",
      timedOut: true
    };
  }

  if (run.code !== 0) {
    return {
      output: "",
      executionTimeMs,
      error: run.stderr || run.output,
      timedOut: false
    };
  }

  return {
    output: normalizeOutput(run.output || ""),
    executionTimeMs,
    timedOut: false
  };
}
