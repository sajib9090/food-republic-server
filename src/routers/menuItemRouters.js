import express from "express";
import {
  handleCreateMenuItem,
  handleDeleteMenuItem,
  handleEditMenuItem,
  handleGetMenuItemById,
  handleGetMenuItems,
} from "../controllers/menuItemController.js";
import { isLoggedIn } from "../middlewares/auth.js";

const menuItemRouter = express.Router();

menuItemRouter.post("/create", handleCreateMenuItem);
menuItemRouter.get("/menu-items", handleGetMenuItems);
menuItemRouter.get("/:id", handleGetMenuItemById);
menuItemRouter.patch("/edit/:id", handleEditMenuItem);
menuItemRouter.delete("/delete/:id", handleDeleteMenuItem);

export default menuItemRouter;
