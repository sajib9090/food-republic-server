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

menuItemRouter.post("/create", isLoggedIn, handleCreateMenuItem);
menuItemRouter.get("/menu-items", handleGetMenuItems);
menuItemRouter.get("/:id", handleGetMenuItemById);
menuItemRouter.patch("/edit/:id", isLoggedIn, handleEditMenuItem);
menuItemRouter.delete("/delete/:id", isLoggedIn, handleDeleteMenuItem);

export default menuItemRouter;
