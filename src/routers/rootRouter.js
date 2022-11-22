import express from "express";
import { getJoin, postJoin, getLogin, postLogin, home } from "../controllers/userController";

const rootRouter = express.Router();

rootRouter.route("/").get(getLogin).post(postLogin);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.get("/home",home)
export default rootRouter;