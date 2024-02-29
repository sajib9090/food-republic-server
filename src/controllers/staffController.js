import createError from "http-errors";
import { ObjectId } from "mongodb";
import { staffCollection } from "../collections/collections.js";

const handleCreatedStaff = async (req, res, next) => {
  const { name } = req.body;
  try {
    if (!name) {
      throw createError(400, "staff name is required");
    }

    const trimmedStaffName = name.toLowerCase().trim().replace(/\s+/g, " ");

    if (trimmedStaffName.length < 3) {
      throw createError(400, "staff name must be at least 3 characters long");
    }

    if (/^\d/.test(trimmedStaffName)) {
      throw createError(400, "staff name cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedStaffName)) {
      throw createError(
        400,
        "staff name cannot start with a special character"
      );
    }

    const exists = await staffCollection.findOne({ name: trimmedStaffName });
    if (exists) {
      throw createError(400, "staff name already exists");
    }

    const newStaff = await staffCollection.insertOne({
      name: trimmedStaffName,
      createdAt: new Date(),
    });

    res.status(200).send({
      success: true,
      message: "staff created successfully",
      staff: newStaff,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetStaffs = async (_, res, next) => {
  try {
    const allStaffs = await staffCollection.find().sort({ name: 1 }).toArray();
    res.status(200).send({
      success: true,
      message: "all staffs retrieved successfully",
      staffs: allStaffs,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleStaffById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid staff id");
    }

    const exists = await staffCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(400, "staff not found");
    }

    res.status(200).send({
      success: true,
      message: "staff retrieved successfully",
      staff: exists,
    });
  } catch (error) {
    next(error);
  }
};

const handleStaffDelete = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid staff id");
    }

    const exists = await staffCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(400, "staff not found");
    }

    await staffCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    res.status(200).send({
      success: true,
      message: "staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleCreatedStaff,
  handleGetStaffs,
  handleGetSingleStaffById,
  handleStaffDelete,
};
