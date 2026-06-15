import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/user.route';
import leaderboardRouter from './routes/leaderboard.route';
import problemRouter from './routes/problem.route';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { battleRouter } from './routes/battle.route';

const app = express();
const allowedOrigins = process.env.ALLOWEDSITE?.split(',').map(s => s.trim()) || [];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parses form data.
app.use(express.static("public"));
app.use(cookieParser());

// router be here
app.use('/battle', battleRouter);
app.use('/user', userRouter)
app.use('/leaderboard', leaderboardRouter)
app.use('/problems', problemRouter)

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

export default app;