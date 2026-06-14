import { Router } from "express";
import { BattlePage } from "../controller/battle.controller";
import { AuthMiddleware } from "../middleware/Auth.middleware";


export const battleRouter = Router();
battleRouter.route('/').get(AuthMiddleware, BattlePage);


