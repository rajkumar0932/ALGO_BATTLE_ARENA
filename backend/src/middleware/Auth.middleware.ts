import asyncHandler from "../util/asynchronous";
import jwt from 'jsonwebtoken';
import { user } from '../dbmodel/users.model';
import { ApiError } from "../util/customerror";
import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { ApiResponse } from "../util/customresponse";

export const AuthMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") || req.body.accessToken;
        console.log("access token in middleware", accessToken);

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
        const result = await pool.query(
            `
    SELECT
        id,
        name,
        email
    FROM users
    WHERE id = $1
    `,
            [(decodedToken as any).id as number] // FIXED _id to id
        );

        const user = result.rows[0];
        // console.log("decoded token", decodedToken);
        if (!user) {
            throw new ApiError(401, "Wrong Access token")
        }
        (req as any).user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token auth")
    }
});
