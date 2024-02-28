import createError from "http-errors";
import { client } from "../config/db.js";
import { ObjectId } from "mongodb";

const categoryCollection = client.db("Food").collection("categories");

const handleCreateCategory = async (req, res, next) => {
  const { category } = req.body;

  try {
    if (!category) {
      throw createError(400, "category is required");
    }

    const trimmedCategory = category.toLowerCase().trim().replace(/\s+/g, " ");

    const existsCategory = await categoryCollection.findOne({
      category: trimmedCategory,
    });

    if (existsCategory) {
      throw createError(400, "category name already exists");
    }

    const newCategory = await categoryCollection.insertOne({
      category: trimmedCategory,
      createdAt: new Date(),
    });

    res.status(200).send({
      success: true,
      message: "category created successfully",
      newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetCategories = async (req, res, next) => {
  try {
    const categories = await categoryCollection
      .find({})
      .sort({ category: 1 })
      .toArray();
    res.status(200).send({
      success: true,
      message: "retrieved categories",
      categories,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }
    const category = await categoryCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!category) {
      throw createError(404, "category not found");
    }
    res.status(200).send({
      success: true,
      message: "category retrieved",
      category,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteCategoryById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }

    const exists = await categoryCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(404, "category not found");
    }

    await categoryCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.status(200).send({
      success: true,
      message: "category deleted",
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleCreateCategory,
  handleGetCategories,
  handleGetSingleCategory,
  handleDeleteCategoryById,
};
