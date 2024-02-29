import express from "express";
import {
  handleCreateTable,
  handleDeleteTable,
  handleEditTableName,
  handleGetSingleTableById,
  handleGetSingleTableByName,
  handleGetTables,
} from "../controllers/tableController.js";

const tableRouter = express.Router();

tableRouter.post("/create", handleCreateTable);
tableRouter.get("/tables", handleGetTables);
tableRouter.get("/:id", handleGetSingleTableById);
tableRouter.get("/table-name/:name", handleGetSingleTableByName);
tableRouter.patch("/edit/:id", handleEditTableName);
tableRouter.delete("/delete/:id", handleDeleteTable);

export default tableRouter;
