export interface userprofile {
    user_id: number,
    bio: string,
    elo_rating: number,
    battle_played: number,
    match_won: number,
    avatar_url: string | null;
    history: any[]
}
