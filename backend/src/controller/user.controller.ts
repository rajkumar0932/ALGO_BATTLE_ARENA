import asynchr from '../util/asynchronous';
import { ApiError } from '../util/customerror';
import { ApiResponse } from '../util/customresponse';
import { uploadOnCloudinary } from '../util/cloudinary';
import { pool } from '../config/db';
import jwt from 'jsonwebtoken';
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
        const hashed_refresh_token = await bcrypt.hash(refreshToken, 10);
        await pool.query(
            `UPDATE users SET refresh_token = $1 WHERE id = $2`,
            [hashed_refresh_token, userId]
        );

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token Generation Error:", error);

        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// ──────────────────────────────────────────────
// POST /register
// ──────────────────────────────────────────────
const registerUser = asynchr(async (req: any, res: any) => {
    const { username, email, fullname, password } = req.body;
    const displayName = fullname?.trim() || username; // fullname is optional, fall back to username

    // checking if no field is vacant
    if ([username, email, password].some((item: string) => !item?.trim())) {
        throw new ApiError(400, "Username, email and password are required");
    }

    // check for existing email or username
    const existingResult = await pool.query(
        `SELECT id FROM users WHERE email = $1 OR name = $2 LIMIT 1`,
        [email, username]
    );

    if (existingResult.rows[0]) {
        throw new ApiError(400, "User already exists");
    }

    //upload avatar to cloudinary (optional)
    let avatarUrl = null;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (avatarLocalPath) {
        const uploadAvatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
        if (uploadAvatarCloudinary) {
            avatarUrl = uploadAvatarCloudinary.url;
        }
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Insert into users
        const userResult = await client.query(
            `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email
        `,
            [username, email, hashedPassword]
        );

        const userId = userResult.rows[0].id;

        // 2. Insert into user_profiles
        await client.query(
            `
        INSERT INTO user_profiles 
        (user_id, bio, elo_rating, battle_played, match_won, history, avatar_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
            [userId, "", 1000, 0, 0, "{}", avatarUrl]
        );

        await client.query("COMMIT");

        return res.status(201).json(
            new ApiResponse(201, userResult.rows[0], "User registered successfully")
        );

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

// ──────────────────────────────────────────────
// POST /login
// ──────────────────────────────────────────────
const loginUser = asynchr(async (req: any, res: any) => {
    const { username, email, password } = req.body;
    console.log(req.body);

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
            new ApiResponse(200, { user: foundUser, accessToken, refreshToken }, "User logged in")
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
        httpOnly: true, //  prevent java script to access the cookie
        secure: true // cookies will only be send from http
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
    // verify refresh token in postgresql
    const getRefreshToken = await pool.query(
        `SELECT refresh_token FROM users WHERE id=$1`,
        [decoded.id]
    );
    const checkDatabase = await bcrypt.compare(incomingRefreshToken, getRefreshToken.rows[0].refresh_token);
    // Find the user in PostgreSQL
    if (!checkDatabase) {
        throw new ApiError(401, getRefreshToken.rows[0].refresh_token);

    }

    const userResult = await pool.query(
        `SELECT id, refresh_token FROM users WHERE id = $1`,
        [decoded.id]
    );

    const foundUser = userResult.rows[0];

    if (!foundUser) {
        throw new ApiError(400, "Invalid refresh token");
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
// POST /forgetPassword
// ──────────────────────────────────────────────
const forgetPassword = asynchr(async (req: any, res: any) => {
    const { email, newPassword } = req.body;

    if (!email) {
        throw new ApiError(400, "please enter the email");
    }

    // Get the user's current password hash from PostgreSQL
    const userResult = await pool.query(
        `SELECT id, password FROM users WHERE email = $1`,
        [email]
    );

    const foundUser = userResult.rows[0];

    if (!foundUser) {
        throw new ApiError(404, "email not found... ");
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
// const displayUser = asynchr(async (req: any, res: any) => {
//     return res.status(200).json(new ApiResponse(200, req.user, "User profile sent"));
// });

// ──────────────────────────────────────────────
// PATCH /updateAvatar
// ──────────────────────────────────────────────
// const updateAvtar = asynchr(async (req: any, res: any) => {
//     const avatarFile = req.files?.avatar?.[0];

//     if (!avatarFile) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     // Upload to cloudinary
//     const uploaded = await uploadOnCloudinary(avatarFile.path);

//     if (!uploaded) {
//         throw new ApiError(500, "Unable to upload avatar to cloudinary");
//     }

//     // Update the avatar_url in user_profiles table (avatar belongs to profile, not user)
//     const updateResult = await pool.query(
//         `UPDATE user_profiles SET avatar_url = $1 WHERE user_id = $2
//          RETURNING user_id, bio, elo_rating, battle_played, match_won, avatar_url`,
//         [uploaded.url, req.user.id]
//     );

//     // If no profile row exists yet, insert one
//     if (updateResult.rowCount === 0) {
//         const insertResult = await pool.query(
//             `INSERT INTO user_profiles (user_id, avatar_url)
//              VALUES ($1, $2)
//              RETURNING user_id, bio, elo_rating, battle_played, match_won, avatar_url`,
//             [req.user.id, uploaded.url]
//         );
//         return res.status(200).json(new ApiResponse(200, insertResult.rows[0], "Avatar updated successfully"));
//     }

//     return res.status(200).json(new ApiResponse(200, updateResult.rows[0], "Avatar updated successfully"));
// });

// ──────────────────────────────────────────────
// PATCH /updateProfile
// Uses access token only (user ID from AuthMiddleware).
// Updates profile fields (bio, avatar_url) — NOT email or username.
// ──────────────────────────────────────────────
const updateProfileInfo = asynchr(async (req: any, res: any) => {
    const { bio } = req.body;
    let avatar_url = null;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

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
        `,
        [bio || null, avatar_url || null, req.user.id]
    );

    // Step 2: If no profile row exists yet, create one
    if (updateResult.rowCount === 0) {
        const insertResult = await pool.query(
            `INSERT INTO user_profiles (user_id, bio, avatar_url, elo_rating, battle_played, match_won)
             VALUES ($1, $2, $3, 1200, 0, 0)
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
        `SELECT u.id, u.name, u.email ,
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

export {
    registerUser,
    loginUser,
    logout,
    regenerateAccessToken,
    forgetPassword,
    updateProfileInfo,
    getUserprofile
};