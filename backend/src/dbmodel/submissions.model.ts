export interface submission {
    id: string,
    user_id: number,
    problem_id: string,
    code: string,
    language: string,
    verdict: submissionVerdict,
    submited_at: Date
}
export type submissionVerdict =
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
    | "Runtime Error"
    | "Compilation Error";