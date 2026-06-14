
import { Router } from 'express';
import { upload } from '../middleware/multer';
import { registerUser, loginUser, getMatchHistory, logout, regenerateAccessToken, updateProfileInfo, getUserprofile, forgetPassword } from '../controller/user.controller';
import { AuthMiddleware } from '../middleware/Auth.middleware';
const userRouter = Router();

userRouter.route('/ping').get((req, res) => res.send('pong'));
userRouter.route('/register').post(
    (req, res, next) => {
        console.log('🔥 ROUTE HIT')
        next()
    },
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },

    ]),
    registerUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(AuthMiddleware, logout);
userRouter.route('/renewAccessToken').post(regenerateAccessToken);
userRouter.route('/forgetPassword').post(AuthMiddleware, forgetPassword);
//userRouter.route('/displayUser').get(AuthMiddleware, displayUser);


userRouter.route('/updateProfile').patch(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },]),
    AuthMiddleware, updateProfileInfo);
userRouter.route("/users/:username").get(AuthMiddleware,

    getUserprofile);
userRouter.route("/matchHistory/:username").get(AuthMiddleware, getMatchHistory)
export default userRouter;

