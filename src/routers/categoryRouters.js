import express from "express";
import { isAdminOrChairman, isLoggedIn } from "../middlewares/auth.js";
import {
  handleCreateCategory,
  handleDeleteCategoryById,
  handleGetCategories,
  handleGetSingleCategory,
} from "../controllers/categoryController.js";
const categoryRouter = express.Router();

categoryRouter.post("/create", handleCreateCategory);
categoryRouter.get("/categories", handleGetCategories);
categoryRouter.get("/:id", handleGetSingleCategory);
categoryRouter.delete("/delete/:id", handleDeleteCategoryById);

export default categoryRouter;
