export interface Problem {
    id: string; // UUID

    title: string;

    difficulty: Difficulty;

    statement: string;
    Action: submissionVerdict;

    created_at: Date;
}
export type Difficulty =
    | "Easy"
    | "Medium"

    | "hard"
export type submissionVerdict =
    | "solve"
    | "solved"

