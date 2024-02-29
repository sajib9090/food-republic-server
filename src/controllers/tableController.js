import createError from "http-errors";
import { ObjectId } from "mongodb";
import { tableCollection } from "../collections/collections.js";

const handleCreateTable = async (_, res, next) => {
  try {
    const newTable = await tableCollection.insertOne({
      name: `table-${(await tableCollection.countDocuments()) + 1}`,
      createdAt: new Date(),
    });
    res.status(200).send({
      success: true,
      message: "table created successfully",
      table: newTable,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetTables = async (_, res, next) => {
  try {
    const tables = await tableCollection
      .find()
      .sort({ createdAt: 1 })
      .toArray();
    res.status(200).send({
      success: true,
      message: "all tables retrieved successfully",
      tables,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleTableById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid table id");
    }

    const exists = await tableCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(404, "table not found");
    }

    res.status(200).send({
      success: true,
      message: "table retrieved successfully",
      table: exists,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleTableByName = async (req, res, next) => {
  const { name } = req.params;
  try {
    if (/^\d/.test(name)) {
      throw createError(400, "table name cannot start with a number");
    }

    const exists = await tableCollection.findOne({ name: name });
    if (!exists) {
      throw createError(404, "table not found");
    }

    res.status(200).send({
      success: true,
      message: "table retrieved successfully",
      table: exists,
    });
  } catch (error) {
    next(error);
  }
};

const handleEditTableName = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid table id");
    }

    const exists = await tableCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(404, "table does not exist");
    }

    if (!name) {
      throw createError(400, "table name is required");
    }

    const trimmedName = name.toLowerCase().trim().replace(/\s+/g, "-");

    if (/^\d/.test(trimmedName)) {
      throw createError(400, "table name cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedName)) {
      throw createError(
        400,
        "table name cannot start with a special character"
      );
    }

    const existingName = await tableCollection.findOne({ name: trimmedName });
    if (existingName) {
      throw createError(400, "this table name already exists");
    }

    const updatedTable = await tableCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name: trimmedName,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    res.status(200).send({
      success: true,
      message: "table name edited successfully",
      table: updatedTable,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteTable = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid table id");
    }

    const exists = await tableCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(404, "table not found");
    }

    await tableCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    res.status(200).send({
      success: true,
      message: "table deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleCreateTable,
  handleGetTables,
  handleGetSingleTableById,
  handleGetSingleTableByName,
  handleEditTableName,
  handleDeleteTable,
};
