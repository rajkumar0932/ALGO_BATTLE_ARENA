import asynchr from '../util/asynchronous';
import { ApiResponse } from '../util/customresponse';
import { pool } from '../config/db';

// ──────────────────────────────────────────────
// GET /problems — fetch problems with pagination
// ──────────────────────────────────────────────
const getProblems = asynchr(async (req: any, res: any) => {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 7; // Fixed pagination limit of 7 problems as requested
    const offset = (page - 1) * limit;

    // Optional filters
    const difficulty = req.query.difficulty; // e.g., 'EASY', 'MEDIUM', 'HARD'
    const search = req.query.search; // e.g., 'Two Sum'

    let query = `
        SELECT 
            id, 
            LOWER(REPLACE(title, ' ', '-')) as slug,
            title, 
            UPPER(difficulty) as difficulty, 
            LEFT(statement, 150) as description,
            10 as testcases_count -- Mock test cases count since table doesn't exist yet
        FROM problems
        WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (difficulty && difficulty !== 'ALL') {
        query += ` AND UPPER(difficulty) = $${paramIndex}`;
        queryParams.push(difficulty.toUpperCase());
        paramIndex++;
    }

    if (search) {
        query += ` AND title ILIKE $${paramIndex}`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    // Add count query to get total number of problems for frontend pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS subquery`;
    const totalCountResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Add pagination and sorting
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const problemsResult = await pool.query(query, queryParams);

    // Format the response to match the frontend Problem interface:
    // { id, slug, title, difficulty, description, _count: { testCases } }
    const formattedProblems = problemsResult.rows.map(row => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        difficulty: row.difficulty,
        description: row.description,
        _count: { testCases: parseInt(row.testcases_count) }
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            problems: formattedProblems,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        }, "Problems fetched successfully")
    );
});

export { getProblems };
