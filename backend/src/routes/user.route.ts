
import { Router } from 'express';
import { upload } from '../middleware/multer';
import { registerUser, loginUser, logout, regenerateAccessToken, changePassword, displayUser, updateAvtar, updateProfileInfo, getUserprofile, getMatchHistory } from '../controller/user.controller';
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
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(AuthMiddleware, logout);
userRouter.route('/renewAccessToken').post(regenerateAccessToken);
userRouter.route('/changePassword').post(AuthMiddleware, changePassword);
userRouter.route('/displayUser').get(AuthMiddleware, displayUser);
userRouter.route('/updateAvatar').patch(AuthMiddleware, upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }

]), updateAvtar);

userRouter.route('/updateProfile').patch(AuthMiddleware, updateProfileInfo);
userRouter.route("/users/:username").get(AuthMiddleware, getUserprofile);

export default userRouter;

