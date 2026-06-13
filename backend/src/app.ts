import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/user.route'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.ALLOWEDSITE,
    credentials: true
}

))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parses form data.
app.use(express.static("public"));
app.use(cookieParser());

// router be here
app.use('/user', userRouter)

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