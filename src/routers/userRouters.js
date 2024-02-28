import express from "express";
import {
  handleChangePassword,
  handleDeleteUserById,
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

userRouter.delete("/delete/:id", handleDeleteUserById);

export default userRouter;
