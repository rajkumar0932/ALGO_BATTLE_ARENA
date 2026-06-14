import { Router } from 'express';
import { GetProblem } from '../controller/problem.controller';

const problemRouter = Router();

problemRouter.route('/').get(GetProblem);

export default problemRouter;
