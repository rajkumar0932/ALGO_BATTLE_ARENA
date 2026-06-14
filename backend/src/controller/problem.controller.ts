import asyncHandler from "../util/asynchronous";
import { Request, Response } from "express";
import { pool } from "../config/db";

export const GetProblem = asyncHandler(async (req: Request, res: Response) => {

    const difficulty = req.query.difficulty as string;
    const search = req.query.search as string;
    const page = Number(req.query.page) || 1;

    const offset = (page - 1) * 10;

    let query = `SELECT * FROM problems`;
    let queryCOUNT = `SELECT COUNT(*) FROM problems`;
    const values: any[] = [];
    const conditions: string[] = [];

    // filter: difficulty
    if (difficulty) {
        values.push(difficulty);
        conditions.push(`difficulty = $${values.length}`);
    }

    // filter: search
    if (search) {
        values.push(`%${search}%`);
        conditions.push(`title ILIKE $${values.length}`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
    }

    // pagination
    values.push(10);
    values.push(offset);

    query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const result = await pool.query(query, values);
    const easyCount = await pool.query(queryCOUNT + ` WHERE difficulty= 'easy'`);
    const mediumCount = await pool.query(queryCOUNT + ` WHERE difficulty= 'medium' `);
    const hardCount = await pool.query(queryCOUNT + ` WHERE difficulty= 'hard' `);


    return res.status(200).json({
        success: true,
        count: result.rowCount,
        easyCount, mediumCount, hardCount,
        data: result.rows
    });
});