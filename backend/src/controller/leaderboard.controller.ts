import asynchr from '../util/asynchronous';
import { ApiResponse } from '../util/customresponse';
import { pool } from '../config/db';

// ──────────────────────────────────────────────
// GET /leaderboard — fetch top players
// ──────────────────────────────────────────────
const getLeaderboard = asynchr(async (req: any, res: any) => {
    const filter = req.query.filter || 'all-time'; // 'all-time', 'this-week', 'today'

    let leaderboardResult;

    if (filter === 'this-week' || filter === 'today') {
        const interval = filter === 'this-week' ? '7 days' : '1 day';
        
        // For time-based filters, we calculate stats based on matches in that timeframe
        // and order by whoever won the most matches recently.
        leaderboardResult = await pool.query(
            `SELECT u.id, u.name as username, 
                    COALESCE(p.elo_rating, 1200) as rating, 
                    COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as wins,
                    COUNT(m.id) - COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as losses,
                    0 as draws
             FROM users u
             JOIN matches m ON (m.player1_id = u.id OR m.player2_id = u.id)
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE m.created_at >= NOW() - INTERVAL '${interval}'
             GROUP BY u.id, u.name, p.elo_rating
             ORDER BY wins DESC, rating DESC
             LIMIT 50`
        );
    } else {
        // all-time (default)
        leaderboardResult = await pool.query(
            `SELECT u.id, u.name as username, 
                    COALESCE(p.elo_rating, 1200) as rating, 
                    COALESCE(p.match_won, 0) as wins, 
                    COALESCE(p.battle_played - p.match_won, 0) as losses,
                    0 as draws
             FROM users u
             LEFT JOIN user_profiles p ON u.id = p.user_id
             ORDER BY rating DESC, wins DESC
             LIMIT 50`
        );
    }

    return res.status(200).json(
        new ApiResponse(200, leaderboardResult.rows, "Leaderboard fetched successfully")
    );
});

export { getLeaderboard };
