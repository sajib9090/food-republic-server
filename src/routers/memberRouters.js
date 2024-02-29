import express from "express";
import { isLoggedIn } from "../middlewares/auth.js";
import {
  handleCreateMember,
  handleDeleteMemberByMobile,
  handleEditInformationByMobile,
  handleGetMembers,
  handleGetSingleMemberByMobile,
  handleUpdateMemberData,
} from "../controllers/memberController.js";

const memberRouter = express.Router();

memberRouter.post("/create", handleCreateMember);
memberRouter.get("/members", handleGetMembers);
memberRouter.get("/:mobile", handleGetSingleMemberByMobile);
memberRouter.patch("/edit/information/:mobile", handleEditInformationByMobile);
// mobile, discount, total_bill, invoice need this information
memberRouter.patch("/update/:mobile", handleUpdateMemberData);
memberRouter.delete("/delete/:mobile", handleDeleteMemberByMobile);

export default memberRouter;
