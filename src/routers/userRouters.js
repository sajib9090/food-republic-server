import express from "express";
import {
  handleChangePassword,
  handleDeleteUserById,
  handleEditUserRole,
  handleGetUserById,
  handleGetUsers,
  handleLoginUser,
  handleLogoutUser,
  handleRefreshToken,
  handleRegisterUser,
} from "../controllers/userController.js";
import { isAdminOrChairman, isLoggedIn } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", handleRegisterUser);
userRouter.post("/auth/login", handleLoginUser);
userRouter.get("/users", handleGetUsers);
userRouter.get("/:id", handleGetUserById);
userRouter.patch("/edit/role/:id", handleEditUserRole);

userRouter.patch("/change/password/:id", handleChangePassword);

userRouter.delete("/delete/:id", handleDeleteUserById);

userRouter.post("/auth/logout", isLoggedIn, handleLogoutUser);
userRouter.get("/auth/refresh-token", handleRefreshToken);

export default userRouter;
