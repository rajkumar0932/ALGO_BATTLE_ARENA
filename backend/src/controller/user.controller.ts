import asynchr from '../util/asynchronous';
import { ApiError } from '../util/customerror';
import { ApiResponse } from '../util/customresponse';
import { uploadOnCloudinary } from '../util/cloudinary';
import { pool } from '../config/db';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// ──────────────────────────────────────────────
// Helper: generate Access + Refresh tokens
// ──────────────────────────────────────────────
const generateAccessAndRefreshToken = async (userId: number) => {
    try {
        // Generate both tokens using jsonwebtoken
        const accessToken = jwt.sign(
            { id: userId },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || '15m') as any }
        );

        const refreshToken = jwt.sign(
            { id: userId },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as any }
        );

        // Store the refresh token in the database
        await pool.query(
            `UPDATE users SET refresh_token = $1 WHERE id = $2`,
            [refreshToken, userId]
        );

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// ──────────────────────────────────────────────
// POST /register
// ──────────────────────────────────────────────
const registerUser = asynchr(async (req: any, res: any) => {
    const { username, email, fullname, password } = req.body;

    // checking if no field is vacant
    if ([username, email, fullname, password].some((item: string) => item?.trim() === "")) {
        throw new ApiError(400, "All fields are compulsory");
    }

    // check for existing email or username
    const existingResult = await pool.query(
        `SELECT id FROM users WHERE email = $1 OR name = $2 LIMIT 1`,
        [email, username]
    );

    if (existingResult.rows[0]) {
        throw new ApiError(400, "User already exists");
    }

    // get location of image stored locally through multer middleware
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is compulsory");
    }

    // upload to cloudinary
    const uploadAvatarCloudinary = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadAvatarCloudinary) {
        throw new ApiError(500, "Unable to upload avatar to cloudinary");
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into PostgreSQL
    const insertResult = await pool.query(
        `INSERT INTO users (name, email, password, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, avatar_url, created_at`,
        [username, email, hashedPassword, uploadAvatarCloudinary.url]
    );

    const createdUser = insertResult.rows[0];

    if (!createdUser) {
        throw new ApiError(500, "Unable to create user in database");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// ──────────────────────────────────────────────
// POST /login
// ──────────────────────────────────────────────
const loginUser = asynchr(async (req: any, res: any) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Provide username or email");
    }
    if (!password) {
        throw new ApiError(400, "Provide password");
    }

    // Find user by email or username using PostgreSQL
    const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1 OR name = $2 LIMIT 1`,
        [email || '', username || '']
    );

    const foundUser = userResult.rows[0];

    // TIMING ATTACK PROTECTION:
    // If the user doesn't exist, we still run bcrypt.compare() against a dummy hash.
    // This ensures the response time is the same whether the user exists or not,
    // preventing attackers from enumerating valid usernames/emails by measuring timing.
    const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
    const isPasswordValid = await bcrypt.compare(
        password,
        foundUser?.password || DUMMY_HASH
    );

    if (!foundUser || !isPasswordValid) {
        // Use the same generic message for both cases so the attacker
        // can't tell if the username was wrong or the password was wrong
        throw new ApiError(400, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(foundUser.id);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "User logged in")
        );
});

// ──────────────────────────────────────────────
// POST /logout
// ──────────────────────────────────────────────
const logout = asynchr(async (req: any, res: any) => {
    // Clear the refresh token from the database using PostgreSQL
    await pool.query(
        `UPDATE users SET refresh_token = NULL WHERE id = $1`,
        [req.user.id]
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ──────────────────────────────────────────────
// POST /renewAccessToken
// ──────────────────────────────────────────────
const regenerateAccessToken = asynchr(async (req: any, res: any) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.header("x-refresh-Token");

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token not available");
    }

    // Verify the refresh token
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as any;

    // Find the user in PostgreSQL
    const userResult = await pool.query(
        `SELECT id, refresh_token FROM users WHERE id = $1`,
        [decoded.id]
    );

    const foundUser = userResult.rows[0];

    if (!foundUser) {
        throw new ApiError(400, "Invalid refresh token");
    }

    // Check if the refresh token matches the one stored in DB
    if (foundUser.refresh_token !== incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is expired or has been used");
    }

    // Generate new tokens (this also rotates the refresh token in DB)
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(foundUser.id);

    const options = {
        secure: true,
        httpOnly: true
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});

// ──────────────────────────────────────────────
// POST /changePassword
// ──────────────────────────────────────────────
const changePassword = asynchr(async (req: any, res: any) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new password required");
    }

    // Get the user's current password hash from PostgreSQL
    const userResult = await pool.query(
        `SELECT id, password FROM users WHERE id = $1`,
        [req.user.id]
    );

    const foundUser = userResult.rows[0];

    if (!foundUser) {
        throw new ApiError(404, "User not found");
    }

    // Verify old password using bcrypt
    const isMatch = await bcrypt.compare(oldPassword, foundUser.password);

    if (!isMatch) {
        throw new ApiError(400, "Enter correct password");
    }

    // Hash new password and update in PostgreSQL
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
        `UPDATE users SET password = $1 WHERE id = $2`,
        [hashedNewPassword, foundUser.id]
    );

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ──────────────────────────────────────────────
// GET /displayUser
// ──────────────────────────────────────────────
const displayUser = asynchr(async (req: any, res: any) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User profile sent"));
});

// ──────────────────────────────────────────────
// PATCH /updateAvatar
// ──────────────────────────────────────────────
const updateAvtar = asynchr(async (req: any, res: any) => {
    const avatarFile = req.files?.avatar?.[0];

    if (!avatarFile) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload to cloudinary
    const uploaded = await uploadOnCloudinary(avatarFile.path);

    if (!uploaded) {
        throw new ApiError(500, "Unable to upload avatar to cloudinary");
    }

    // Update the avatar_url in user_profiles table (avatar belongs to profile, not user)
    const updateResult = await pool.query(
        `UPDATE user_profiles SET avatar_url = $1 WHERE user_id = $2
         RETURNING user_id, bio, elo_rating, battle_played, match_won, avatar_url`,
        [uploaded.url, req.user.id]
    );

    // If no profile row exists yet, insert one
    if (updateResult.rowCount === 0) {
        const insertResult = await pool.query(
            `INSERT INTO user_profiles (user_id, avatar_url)
             VALUES ($1, $2)
             RETURNING user_id, bio, elo_rating, battle_played, match_won, avatar_url`,
            [req.user.id, uploaded.url]
        );
        return res.status(200).json(new ApiResponse(200, insertResult.rows[0], "Avatar updated successfully"));
    }

    return res.status(200).json(new ApiResponse(200, updateResult.rows[0], "Avatar updated successfully"));
});

// ──────────────────────────────────────────────
// PATCH /updateProfile
// Uses access token only (user ID from AuthMiddleware).
// Updates profile fields (bio, avatar_url) — NOT email or username.
// ──────────────────────────────────────────────
const updateProfileInfo = asynchr(async (req: any, res: any) => {
    const { bio, avatar_url } = req.body;

    // At least one field must be provided
    if (bio === undefined && avatar_url === undefined) {
        throw new ApiError(400, "Provide at least bio or avatar_url to update");
    }

    // Step 1: Try to update the existing profile row
    const updateResult = await pool.query(
        `UPDATE user_profiles
         SET bio = COALESCE($1, bio),
             avatar_url = COALESCE($2, avatar_url)
         WHERE user_id = $3
         RETURNING user_id, bio, elo_rating, battle_played, match_won, avatar_url`,
        [bio || null, avatar_url || null, req.user.id]
    );

    // Step 2: If no profile row exists yet, create one
    if (updateResult.rowCount === 0) {
        const insertResult = await pool.query(
            `INSERT INTO user_profiles (user_id, bio, avatar_url)
             VALUES ($1, $2, $3)
             RETURNING user_id, bio, elo_rating, battle_played, match_won, avatar_url`,
            [req.user.id, bio || null, avatar_url || null]
        );
        return res.status(201).json(new ApiResponse(201, insertResult.rows[0], "Profile created successfully"));
    }

    return res.status(200).json(new ApiResponse(200, updateResult.rows[0], "Profile updated successfully"));
});

// ──────────────────────────────────────────────
// GET /users/:username — get public profile
// ──────────────────────────────────────────────
const getUserprofile = asynchr(async (req: any, res: any) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    // Join users with user_profiles in PostgreSQL
    const profileResult = await pool.query(
        `SELECT u.id, u.name, u.email, u.created_at,
                p.bio, p.elo_rating, p.battle_played, p.match_won, p.avatar_url
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.name = $1`,
        [username]
    );

    const profile = profileResult.rows[0];

    if (!profile) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, profile, "User profile fetched"));
});

// ──────────────────────────────────────────────
// GET /matchHistory — get battle history
// ──────────────────────────────────────────────
const getMatchHistory = asynchr(async (req: any, res: any) => {
    const userId = req.user.id;

    // Query match history from PostgreSQL with a JOIN on problems
    const historyResult = await pool.query(
        `SELECT m.id, m.player1_id, m.player2_id, m.winner_id, m.status, m.created_at,
                p.title AS problem_title
         FROM matches m
         LEFT JOIN problems p ON m.problem_id = p.id
         WHERE m.player1_id = $1 OR m.player2_id = $1
         ORDER BY m.created_at DESC
         LIMIT 50`,
        [userId]
    );

    return res.status(200).json(
        new ApiResponse(200, historyResult.rows, "Match history fetched")
    );
});

// ──────────────────────────────────────────────
// GET /leaderboard — fetch top players
// ──────────────────────────────────────────────
const getLeaderboard = asynchr(async (req: any, res: any) => {
    const filter = req.query.filter || 'all-time'; // 'all-time', 'this-week', 'today'

    let leaderboardResult;

    if (filter === 'this-week' || filter === 'today') {
        const interval = filter === 'this-week' ? '7 days' : '1 day';

        // For time-based filters, we calculate stats based on matches in that timeframe
        // and order by whoever won the most matches recently.
        leaderboardResult = await pool.query(
            `SELECT u.id, u.name as username, 
                    COALESCE(p.elo_rating, 1200) as rating, 
                    COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as wins,
                    COUNT(m.id) - COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as losses,
                    0 as draws
             FROM users u
             JOIN matches m ON (m.player1_id = u.id OR m.player2_id = u.id)
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE m.created_at >= NOW() - INTERVAL '${interval}'
             GROUP BY u.id, u.name, p.elo_rating
             ORDER BY wins DESC, rating DESC
             LIMIT 50`
        );
    } else {
        // all-time (default)
        leaderboardResult = await pool.query(
            `SELECT u.id, u.name as username, 
                COALESCE(p.elo_rating, 1200) as rating, 
                COALESCE(p.match_won, 0) as wins, 
                COALESCE(p.battle_played - p.match_won, 0) as losses,
                0 as draws
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         ORDER BY rating DESC, wins DESC
         LIMIT 50`
        );

        return res.status(200).json(
            new ApiResponse(200, leaderboardResult.rows, "Leaderboard fetched successfully")
        );
    });

export {
    registerUser,
    loginUser,
    logout,
    regenerateAccessToken,
    changePassword,
    displayUser,
    updateAvtar,
    updateProfileInfo,
    getUserprofile,
    getMatchHistory
};