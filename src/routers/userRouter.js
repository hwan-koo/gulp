import express from "express";
import { startKakaoLogin,finishKakaoLogin ,logout,startGithubLogin,finishGithubLogin } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/github/start",startGithubLogin);
userRouter.get("/github/finish",finishGithubLogin);
userRouter.get("/kakao/start", startKakaoLogin);
userRouter.get("/kakao/finish", finishKakaoLogin);

export default userRouter;