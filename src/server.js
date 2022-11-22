import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev")
app.use(logger);
app.use(express.urlencoded({extended: true}));
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2000000
    },
    store: MongoStore.create({mongoUrl:process.env.DB_URL})
}))

app.use(localsMiddleware)

app.use("/",rootRouter);
app.use("/users",userRouter);

export default app;


