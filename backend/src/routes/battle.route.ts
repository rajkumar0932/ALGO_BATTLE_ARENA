import { Router } from "express";
import { BattlePage, getBots } from "../controller/battle.controller";
import { AuthMiddleware } from "../middleware/Auth.middleware";


export const battleRouter = Router();
battleRouter.route('/').get(AuthMiddleware, BattlePage);
battleRouter.route('/online').get(AuthMiddleware, (req, res) => res.status(501).json({ message: "Not implemented" }));
battleRouter.route('/offline').get(AuthMiddleware, getBots);
battleRouter.route('/custom').get(AuthMiddleware, (req, res) => res.status(501).json({ message: "Not implemented" }));
