import { Router } from 'express';
import { GetLeaderBoard } from '../controller/leaderboard.controller';

const leaderboardRouter = Router();

leaderboardRouter.route('/').get(GetLeaderBoard);

export default leaderboardRouter;
