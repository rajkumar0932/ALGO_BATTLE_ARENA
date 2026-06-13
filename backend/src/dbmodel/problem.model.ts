export interface Problem {
    id: string; // UUID

    title: string;

    difficulty: Difficulty;

    statement: string;

    created_at: Date;
}
export type Difficulty =
    | "Easy"
    | "Medium"

    | "hard"


