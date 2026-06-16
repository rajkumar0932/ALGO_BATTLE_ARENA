"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSubmission = evaluateSubmission;
// Hardcoded test cases for MVP. In a real system, fetch from PostgreSQL based on problemSlug
var problemDatabase = {
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
 * Builds the JS wrapper code that executes the user's function against the test cases.
 */
function buildJavascriptWrapper(userCode, problemSlug) {
    var problem = problemDatabase[problemSlug];
    if (!problem)
        throw new Error("Problem ".concat(problemSlug, " not found in database."));
    var wrapper = "".concat(userCode, "\n\n");
    wrapper += "// --- HIDDEN TEST CASES START ---\n";
    wrapper += "try {\n";
    problem.testCases.forEach(function (tc, index) {
        wrapper += "  const result".concat(index + 1, " = ").concat(problem.funcName, "(").concat(tc.input, ");\n");
        wrapper += "  if (JSON.stringify(result".concat(index + 1, ") !== JSON.stringify(").concat(tc.expectedOutput, ")) {\n");
        wrapper += "    throw new Error(\"Test Case ".concat(index + 1, " Failed. Expected ").concat(tc.expectedOutput, " but got \" + JSON.stringify(result").concat(index + 1, "));\n");
        wrapper += "  }\n";
    });
    wrapper += "  console.log(\"ALL_CASES_PASSED\");\n";
    wrapper += "} catch (err) {\n";
    wrapper += "  console.log(\"ASSERTION_ERROR: \" + err.message);\n";
    wrapper += "}\n";
    return wrapper;
}
/**
 * Evaluates the user's code using the public Piston API.
 */
function evaluateSubmission(code, language, problemSlug) {
    return __awaiter(this, void 0, Promise, function () {
        var problem, wrappedCode, startTime, response, data, executionTimeMs, output, error, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Only JS supported for MVP wrapper logic
                    if (language !== "javascript") {
                        return [2 /*return*/, { verdict: "COMPILATION_ERROR", passedCases: 0, totalCases: 0, executionTimeMs: 0 }];
                    }
                    problem = problemDatabase[problemSlug];
                    if (!problem) {
                        return [2 /*return*/, { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: 0, executionTimeMs: 0 }];
                    }
                    wrappedCode = buildJavascriptWrapper(code, problemSlug);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    startTime = Date.now();
                    return [4 /*yield*/, fetch("https://emkc.org/api/v2/piston/execute", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                language: "javascript",
                                version: "18.15.0", // Piston API JS version
                                files: [{ name: "main.js", content: wrappedCode }]
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    executionTimeMs = Date.now() - startTime;
                    if (!response.ok || !data.run) {
                        console.error("[Judge] API Error:", data);
                        return [2 /*return*/, { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs: executionTimeMs }];
                    }
                    output = data.run.stdout;
                    error = data.run.stderr;
                    // Check for runtime crash/syntax errors
                    if (error && error.trim().length > 0) {
                        console.log("[Judge] Stderr:", error);
                        return [2 /*return*/, { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs: executionTimeMs }];
                    }
                    // Check for our custom assertion markers
                    if (output.includes("ALL_CASES_PASSED")) {
                        return [2 /*return*/, { verdict: "ACCEPTED", passedCases: problem.testCases.length, totalCases: problem.testCases.length, executionTimeMs: executionTimeMs }];
                    }
                    else if (output.includes("ASSERTION_ERROR:")) {
                        console.log("[Judge] Failed Assertions:", output.trim());
                        // For MVP, if it fails, we assume 0 passed (or we could parse exactly which case failed)
                        return [2 /*return*/, { verdict: "WRONG_ANSWER", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs: executionTimeMs }];
                    }
                    else {
                        // Something unexpected was printed, or the function didn't return
                        console.log("[Judge] Unexpected Output:", output.trim());
                        return [2 /*return*/, { verdict: "WRONG_ANSWER", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs: executionTimeMs }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("[Judge] Fetch Error:", err_1);
                    return [2 /*return*/, { verdict: "RUNTIME_ERROR", passedCases: 0, totalCases: problem.testCases.length, executionTimeMs: 0 }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
