import createError from "http-errors";
import jwt from "jsonwebtoken";
import { accessTokenSecret } from "../../secrets.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw createError(401, "security key not found. Please Login First");
    }

    const decoded = jwt.verify(token, accessTokenSecret);

    // send user information
    req.user = decoded.user;
    if (!decoded) {
      throw createError(
        403,
        "failed to authenticate token. please login again"
      );
    }

    next();
  } catch (error) {
    return next(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (token) {
      throw createError(400, "user already logged in");
    }

    next();
  } catch (error) {
    return next(error);
  }
};

const isAdminOrChairman = async (req, res, next) => {
  try {
    // extract admin value
    const authorityUser =
      (req.user && req.user.role == "chairman") ||
      (req.user && req.user.role == "admin");
    if (!authorityUser) {
      throw createError(403, "forbidden access. only authority can access");
    }

    next();
  } catch (error) {
    return next(error);
  }
};

export { isAdminOrChairman, isLoggedIn, isLoggedOut };
