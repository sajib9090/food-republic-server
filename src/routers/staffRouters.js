import express from "express";
import {
  handleCreatedStaff,
  handleGetSingleStaffById,
  handleGetStaffs,
  handleStaffDelete,
} from "../controllers/staffController.js";

const staffRouter = express.Router();

staffRouter.post("/create", handleCreatedStaff);
staffRouter.get("/staffs", handleGetStaffs);
staffRouter.get("/:id", handleGetSingleStaffById);
staffRouter.delete("/delete/:id", handleStaffDelete);

export default staffRouter;
