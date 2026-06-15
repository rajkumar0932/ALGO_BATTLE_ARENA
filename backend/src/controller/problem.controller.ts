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
        conditions.push(`difficulty::text ILIKE $${values.length}`);
    }

    // filter: search
    if (search) {
        values.push(`%${search}%`);
        conditions.push(`title ILIKE $${values.length}`);
    }

    let countQuery = `SELECT COUNT(*) FROM problems`;
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
        countQuery += ` WHERE ` + conditions.join(" AND ");
    }

    const countValues = [...values];

    // pagination
    values.push(10);
    values.push(offset);

    query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const result = await pool.query(query, values);
    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    const easyCount = await pool.query(`SELECT COUNT(*) FROM problems WHERE difficulty::text ILIKE 'easy'`);
    const mediumCount = await pool.query(`SELECT COUNT(*) FROM problems WHERE difficulty::text ILIKE 'medium'`);
    const hardCount = await pool.query(`SELECT COUNT(*) FROM problems WHERE difficulty::text ILIKE 'hard'`);

    return res.status(200).json({
        success: true,
        count: totalCount,
        easyCount: parseInt(easyCount.rows[0].count, 10),
        mediumCount: parseInt(mediumCount.rows[0].count, 10),
        hardCount: parseInt(hardCount.rows[0].count, 10),
        data: result.rows
    });
});