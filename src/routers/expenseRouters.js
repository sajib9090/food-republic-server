import express from "express";
import { isLoggedIn } from "../middlewares/auth.js";
import {
  handleCreateExpense,
  handleDeleteExpenseById,
  handleGetExpensesByQuery,
} from "../controllers/expenseController.js";

const expenseRouter = express.Router();

expenseRouter.post("/create", handleCreateExpense);
expenseRouter.delete("/delete/:id", handleDeleteExpenseById);
expenseRouter.get("/find", handleGetExpensesByQuery);

export default expenseRouter;
