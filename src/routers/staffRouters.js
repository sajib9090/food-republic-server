import express from "express";
import {
  handleCreatedStaff,
  handleGetSingleStaffById,
  handleGetStaffs,
  handleStaffDelete,
} from "../controllers/staffController.js";
import { isLoggedIn } from "../middlewares/auth.js";

const staffRouter = express.Router();

staffRouter.post("/create", isLoggedIn, handleCreatedStaff);
staffRouter.get("/staffs", handleGetStaffs);
staffRouter.get("/:id", handleGetSingleStaffById);
staffRouter.delete("/delete/:id", isLoggedIn, handleStaffDelete);

export default staffRouter;
