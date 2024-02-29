import createError from "http-errors";
import { ObjectId } from "mongodb";
import validator from "validator";
import {
  expenseCollection,
  usersCollection,
} from "../collections/collections.js";

const handleCreateExpense = async (req, res, next) => {
  const { title, expense_amount, expense_creator } = req.body;
  try {
    if (!title || !expense_amount || !expense_creator) {
      throw createError(400, "missing required field");
    }

    const trimmedTitle = title.toLowerCase().trim().replace(/\s+/g, " ");

    if (/^[^a-zA-Z0-9]/.test(trimmedTitle)) {
      throw createError(
        400,
        "title cannot start with a number or a special character"
      );
    }

    const convertedExpenseAmount = parseFloat(expense_amount);
    if (isNaN(parseFloat(convertedExpenseAmount))) {
      throw createError(400, "expense amount should be number");
    }

    const existsUser = await usersCollection.findOne({
      username: expense_creator,
    });

    if (!existsUser) {
      throw createError(404, "invalid user");
    }

    const newExpense = await expenseCollection.insertOne({
      title: trimmedTitle,
      expense_amount: convertedExpenseAmount,
      expense_creator: existsUser?.username,
      createdAt: new Date(),
    });
    res.status(200).send({
      success: true,
      message: "expense created",
      data: newExpense,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteExpenseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      throw createError(400, "invalid id");
    }

    const exists = await expenseCollection.findOne({ _id: new ObjectId(id) });
    if (!exists) {
      throw createError(404, "not found");
    }

    await expenseCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    res.status(200).send({
      success: true,
      message: "expense deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const handleGetExpensesByQuery = async (req, res, next) => {
  const { date, id, startDate, endDate } = req.query;

  try {
    if (!date && !id && !(startDate && endDate)) {
      throw createError(400, "at least one query parameter must be provided");
    }
    if (id && !ObjectId.isValid(id)) {
      throw createError(400, "Invalid id");
    }

    if (date && !validator.isISO8601(date)) {
      throw createError(
        400,
        "invalid date format. please provide a valid date."
      );
    }

    if (id) {
      const expense = await expenseCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!expense) {
        throw createError(404, `data not found with this id: ${id}`);
      }
      res.status(200).send({
        success: true,
        message: "expense retrieved successfully",
        data: expense,
      });
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const expenses = await expenseCollection
        .find({ createdAt: { $gte: startOfDay, $lte: endOfDay } })
        .sort({ createdAt: 1 })
        .toArray();

      if (expenses.length == 0) {
        res.status(404).send({
          success: false,
          message: `no data found for the specified date: ${date}`,
        });
      }
      res.status(200).send({
        success: true,
        message: "data retrieved successfully",
        data: expenses,
      });
    }

    if (startDate && endDate) {
      if (!validator.isISO8601(startDate) || !validator.isISO8601(endDate)) {
        throw createError(
          400,
          "Invalid date format. Please provide valid dates."
        );
      }

      let query = {};
      query.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };

      let pipeline = [
        { $match: query },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            expenses: { $push: "$$ROOT" },
            totalExpenses: { $sum: "$expense_amount" },
          },
        },
        { $sort: { _id: 1 } },
      ];

      let result = await expenseCollection.aggregate(pipeline).toArray();

      res.status(200).send({
        success: true,
        message: "expense data retrieved successfully",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

export {
  handleCreateExpense,
  handleDeleteExpenseById,
  handleGetExpensesByQuery,
};
