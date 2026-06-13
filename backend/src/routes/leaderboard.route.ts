import { Router } from 'express';
import { getLeaderboard } from '../controller/leaderboard.controller';

const leaderboardRouter = Router();

leaderboardRouter.route('/').get(getLeaderboard);

export default leaderboardRouter;
