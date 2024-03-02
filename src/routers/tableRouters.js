import express from "express";
import {
  handleCreateTable,
  handleDeleteTable,
  handleEditTableName,
  handleGetSingleTableById,
  handleGetSingleTableByName,
  handleGetTables,
} from "../controllers/tableController.js";
import { isLoggedIn } from "../middlewares/auth.js";

const tableRouter = express.Router();

tableRouter.post("/create", isLoggedIn, handleCreateTable);
tableRouter.get("/tables", isLoggedIn, handleGetTables);
tableRouter.get("/:id", handleGetSingleTableById);
tableRouter.get("/table-name/:name", handleGetSingleTableByName);
tableRouter.patch("/edit/:id", isLoggedIn, handleEditTableName);
tableRouter.delete("/delete/:id", isLoggedIn, handleDeleteTable);

export default tableRouter;
