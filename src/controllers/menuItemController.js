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
      data: newMenuItem,
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
      data: menuItems,
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
      data: existingItem,
    });
  } catch (error) {
    next(error);
  }
};

const handleEditMenuItem = async (req, res, next) => {
  const { id } = req.params;
  const { item_name, item_price, discount } = req.body;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }

    //check item exists or not with this id
    const exists = await menuItemCollection.findOne({ _id: new ObjectId(id) });

    if (!exists) {
      return next(createError(400, "item not found"));
    }

    // trimmed item input name
    const trimmedItemName = item_name
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    // if name same as db don't enter if block
    if (
      item_name &&
      item_name?.length !== 0 &&
      trimmedItemName !== exists?.item_name
    ) {
      const exists = await menuItemCollection.findOne({
        item_name: trimmedItemName,
      });
      if (exists) {
        throw createError(400, "item name already exist");
      }

      const updatedMenuItem = await menuItemCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            item_name: trimmedItemName,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      res.status(200).send({
        success: true,
        message: "menu item name updated successfully",
        data: updatedMenuItem,
      });
    }

    if (item_price && isNaN(parseFloat(item_price))) {
      throw createError(400, "price should be number");
    }

    const parsedPrice = item_price && parseFloat(item_price);
    if (parsedPrice && parsedPrice != exists.item_price) {
      const updatedPrice = await menuItemCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            item_price: parsedPrice,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      res.status(200).send({
        success: true,
        message: "menu item price updated successfully",
        data: updatedPrice,
      });
    }
    console.log(discount);
    if (discount != undefined && discount !== exists?.discount) {
      const updated = await menuItemCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            discount: discount,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      res.status(200).send({
        success: true,
        message: "item discount value updated",
        data: updated,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "no value updated",
      });
    }
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
