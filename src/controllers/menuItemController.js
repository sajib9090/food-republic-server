import createError from "http-errors";
import { ObjectId } from "mongodb";
import {
  menuItemCollection,
  categoryCollection,
} from "../collections/collections.js";

const handleCreateMenuItem = async (req, res, next) => {
  const { item_name, item_price, category } = req.body;
  try {
    if ((!item_name, !item_price, !category)) {
      throw createError(400, "all fields are required");
    }

    const trimmedItemName = item_name.toLowerCase().trim().replace(/\s+/g, " ");

    if (trimmedItemName.length < 3) {
      throw createError(400, "item name must be at least 3 characters long");
    }

    if (/^\d/.test(trimmedItemName)) {
      throw createError(400, "item name cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedItemName)) {
      throw createError(
        400,
        "menu item name cannot start with a special character"
      );
    }

    const existingItemName = await menuItemCollection.findOne({
      item_name: trimmedItemName,
    });
    if (existingItemName) {
      throw createError(400, "item name already exists");
    }

    if (isNaN(parseFloat(item_price))) {
      throw createError(400, "price should be number");
    }

    let price = parseFloat(item_price);

    const trimmedCategoryName = category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    if (/^\d/.test(trimmedCategoryName)) {
      throw createError(400, "category cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedCategoryName)) {
      throw createError(400, "category cannot start with a special character");
    }

    const existingCategory = await categoryCollection.findOne({
      category: trimmedCategoryName,
    });
    if (!existingCategory) {
      throw createError(400, "category not found");
    }

    const newMenuItem = await menuItemCollection.insertOne({
      item_name: trimmedItemName,
      item_price: price,
      category: trimmedCategoryName,
      discount: true,
      createdAt: new Date(),
    });

    res.status(200).send({
      success: true,
      message: "menu item created successfully",
      menuItem: newMenuItem,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetMenuItems = async (req, res, next) => {
  try {
    const menuItems = await menuItemCollection
      .find()
      .sort({ item_name: 1 })
      .toArray();
    res.status(200).send({
      success: true,
      message: "menu items retrieved successfully",
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetMenuItemById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }

    const existingItem = await menuItemCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existingItem) {
      throw createError(400, "item not found");
    }
    res.status(200).send({
      success: true,
      message: "item retrieved",
      menuItem: existingItem,
    });
  } catch (error) {
    next(error);
  }
};

const handleEditMenuItem = async (req, res, next) => {
  const { id } = req.params;
  const updatedItem = req.body;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }

    const exists = await menuItemCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      return next(createError(400, "item not found"));
    }

    const trimmedItemName = updatedItem?.item_name
      ? updatedItem.item_name.toLowerCase().trim().replace(/\s+/g, " ")
      : exists?.item_name;

    if (updatedItem.item_name) {
      const exists = await menuItemCollection.findOne({
        item_name: trimmedItemName,
      });
      if (exists) {
        throw createError(400, "item name already exists");
      }
    }

    const price = updatedItem?.item_price
      ? updatedItem?.item_price
      : exists?.item_price;

    if (isNaN(parseFloat(price))) {
      throw createError(400, "price should be number");
    }

    const parsedPrice = parseFloat(price);

    await menuItemCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updatedItem,
          item_price: parsedPrice,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).send({
      success: true,
      message: "item updated",
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteMenuItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }

    const exists = await menuItemCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      return next(createError(400, "item not found"));
    }

    await menuItemCollection.findOneAndDelete({ _id: new ObjectId(id) });

    res.status(200).send({
      success: true,
      message: "item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleCreateMenuItem,
  handleGetMenuItems,
  handleGetMenuItemById,
  handleEditMenuItem,
  handleDeleteMenuItem,
};
