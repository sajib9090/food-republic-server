import createError from "http-errors";
import bcrypt from "bcryptjs";
import { client } from "../config/db.js";
import createJWT from "../helper/createJWT.js";
import { accessTokenSecret, refreshTokenSecret } from "../../secrets.js";
import { ObjectId } from "mongodb";

const usersCollection = client.db("Food").collection("users");

const handleRegisterUser = async (req, res, next) => {
  const { username, password, role } = req.body;
  try {
    if (!username || !password) {
      throw createError(400, "username or Password cannot be empty!");
    }

    const trimmedUserName = username.toLowerCase().replace(/\s/g, "");

    if (trimmedUserName.length < 3) {
      throw createError(400, "username must be at least 3 characters long");
    }

    if (typeof trimmedUserName !== "string") {
      throw createError(400, "username must be a string");
    }

    if (trimmedUserName.length < 3) {
      throw createError(400, "username must be at least 3 characters long");
    }

    if (/^\d/.test(trimmedUserName)) {
      throw createError(400, "username cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedUserName)) {
      throw createError(400, "username cannot start with a special character");
    }

    const exists = await usersCollection.findOne({ username: trimmedUserName });
    if (exists) {
      throw createError(400, "username already in use");
    }

    if (password.length < 6) {
      throw createError(400, "password must be at least 6 characters long");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = {
      username: trimmedUserName,
      password: hash,
      isBanned: false,
      role: role.toLowerCase() || "manager",
    };

    const user = await usersCollection.insertOne(newUser);

    res.status(200).send({
      success: true,
      message: "user created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

//login controller
const handleLoginUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      throw createError(400, "username or password cannot empty");
    }

    const trimmedUserName = username.toLowerCase().replace(/\s/g, "");

    if (trimmedUserName.length < 3) {
      throw createError(400, "username must be at least 3 characters long");
    }

    if (typeof trimmedUserName !== "string") {
      throw createError(400, "username must be a string");
    }

    if (trimmedUserName.length < 3) {
      throw createError(400, "username must be at least 3 characters long");
    }

    if (/^\d/.test(trimmedUserName)) {
      throw createError(400, "username cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedUserName)) {
      throw createError(400, "username cannot start with a special character");
    }

    const user = await usersCollection.findOne({
      username: trimmedUserName,
    });
    if (!user) {
      throw createError(404, "username not found");
    }

    if (password.length < 6) {
      throw createError(400, "password must be at least 6 characters long");
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      throw createError.Unauthorized("incorrect password");
    }

    if (user.isBanned) {
      throw createError.Unauthorized(
        "you are banned. please contact with authority"
      );
    }

    //TOKEN COOKIE
    const accessToken = await createJWT({ user }, accessTokenSecret, "1m");
    res.cookie("accessToken", accessToken, {
      maxAge: 60 * 1000, // 1 minute in milliseconds
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const refreshToken = await createJWT({ user }, refreshTokenSecret, "7d");
    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const userWithoutPassword = { ...user, password: undefined };

    res.status(200).send({
      success: true,
      message: "logged in successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// get all users
const handleGetUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const regExSearch = new RegExp(".*" + search + ".*", "i");

    // necessary filter
    const filter = {
      username: { $regex: regExSearch },
    };

    const options = { projection: { password: 0 } };

    const users = await usersCollection
      .find(filter, options)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send({
      success: true,
      message: "users retrieved successfully",
      users,
    });
  } catch (error) {
    next(error);
  }
};

//get single user by id
const handleGetUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid user id");
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw createError(404, "user not found");
    }
    const userWithoutPassword = { ...user, password: undefined };
    res.status(200).send({
      success: true,
      message: "user found",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// patch user role
const handleEditUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid user id");
    }

    if (!role) {
      throw createError(400, "role is required");
    }

    const trimmedRole = role.toLowerCase();

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw createError(404, "user not found");
    }

    if (user.role == trimmedRole) {
      throw createError(403, `already has this role: ${trimmedRole}`);
    }

    if (
      trimmedRole != "manager" &&
      trimmedRole != "chairman" &&
      trimmedRole != "admin"
    ) {
      throw createError(400, "invalid role");
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          role: trimmedRole,
        },
      },
      { returnDocument: "after" }
    );

    const userWithoutPassword = { ...updatedUser, password: undefined };
    res.status(201).send({
      success: true,
      message: "user role updated",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// patch user password
const handleChangePassword = async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid user id");
    }

    if (!password) {
      throw createError(400, "missing password");
    }

    if (password.length < 6) {
      throw createError(400, "password must be at least 6 characters long");
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      throw createError(404, "user not found");
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      throw createError(
        400,
        "new password cannot be the same as current password"
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          password: hash,
        },
      },
      { returnDocument: "after" }
    );

    res.status(200).send({
      success: true,
      message: "user password updated",
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleRegisterUser,
  handleLoginUser,
  handleGetUsers,
  handleGetUserById,
  handleEditUserRole,
  handleChangePassword,
};
