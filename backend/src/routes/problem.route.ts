import { Router } from 'express';
import { getProblems } from '../controller/problem.controller';

const problemRouter = Router();

problemRouter.route('/').get(getProblems);

export default problemRouter;
