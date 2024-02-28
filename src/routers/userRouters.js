import express from "express";
import {
  handleChangePassword,
  handleEditUserRole,
  handleGetUserById,
  handleGetUsers,
  handleLoginUser,
  handleRegisterUser,
} from "../controllers/userController.js";
import { isAdminOrChairman, isLoggedIn } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", isLoggedIn, isAdminOrChairman, handleRegisterUser);
userRouter.post("/login", handleLoginUser);
userRouter.get("/users", handleGetUsers);
userRouter.get("/:id", handleGetUserById);
userRouter.patch(
  "/edit/role/:id",
  isLoggedIn,
  isAdminOrChairman,
  handleEditUserRole
);

userRouter.patch(
  "/change/password/:id",
  isLoggedIn,
  isAdminOrChairman,
  handleChangePassword
);

export default userRouter;
