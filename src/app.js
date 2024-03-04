import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import createError from "http-errors";
import { rateLimit } from "express-rate-limit";
import userRouter from "./routers/userRouters.js";
import categoryRouter from "./routers/categoryRouters.js";
import tableRouter from "./routers/tableRouters.js";
import staffRouter from "./routers/staffRouters.js";
import menuItemRouter from "./routers/menuItemRouters.js";
import memberRouter from "./routers/memberRouters.js";
import expenseRouter from "./routers/expenseRouters.js";
import soldInvoicesRouter from "./routers/soldInvoicesRouters.js";

const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res
      .status(429)
      .json({ success: false, message: "Too many requests, try again later." });
  },
});

//middleware
app.use(
  cors({
    origin: "https://foodrepublic111.web.app",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v2/user", userRouter);
app.use("/api/v2/category", categoryRouter);
app.use("/api/v2/table", tableRouter);
app.use("/api/v2/staff", staffRouter);
app.use("/api/v2/menu-item", menuItemRouter);
app.use("/api/v2/member", memberRouter);
app.use("/api/v2/expense", expenseRouter);
app.use("/api/v2/sold-invoice", soldInvoicesRouter);

app.get("/", (req, res) => {
  res.status(200).send({ success: true, message: "Server is running" });
});

//client error handling
app.use((req, res, next) => {
  createError(404, "Route not found!");
  next();
});

//server error handling
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

export default app;
