export interface Match {
    id: number;

    player1_id: number;

    player2_id: number;

    winner_id: number | null;

    elo_change: number;

    played_at: Date;
}