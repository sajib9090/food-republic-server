import createError from "http-errors";
import { ObjectId } from "mongodb";
import validator from "validator";
import {
  soldInvoiceCollection,
  staffCollection,
  tableCollection,
} from "../collections/collections.js";

const handleCreateSoldInvoice = async (req, res, next) => {
  const { table_name, served_by, member, items, total_discount, total_bill } =
    req.body;
  try {
    if (!table_name || !served_by || !items || !total_bill) {
      throw createError(
        400,
        "table name, served by name, items and total bill are required fields"
      );
    }

    const existsTable = await tableCollection.findOne({ name: table_name });
    if (!existsTable) {
      throw createError(404, "wrong table request");
    }

    const existsStaff = await staffCollection.findOne({ name: served_by });
    if (!existsStaff) {
      throw createError(404, "wrong staff request");
    }

    const totalBill = parseFloat(total_bill);

    const totalDiscount = total_discount ? parseFloat(total_discount) : 0;

    const memberMobile = member && member ? member : null;

    const countInvoice = await soldInvoiceCollection.countDocuments();

    const newInvoice = await soldInvoiceCollection.insertOne({
      fr_id: countInvoice + 1,
      table_name: existsTable?.name,
      served_by: existsStaff?.name,
      member: memberMobile,
      total_bill: totalBill,
      total_discount: totalDiscount,
      createdAt: new Date(),
      items: [...items],
    });

    res.status(200).send({
      success: true,
      message: "invoice created",
      data: newInvoice,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSoldInvoiceByQuery = async (req, res, next) => {
  const { id, serial, date, month } = req.query;
  try {
    if (!id && !serial && !date && !month) {
      throw createError(400, "at least one query parameter must be provided");
    }
    // valid id check
    if (id && !ObjectId.isValid(id)) {
      throw createError(400, "Invalid id");
    }

    // valid serial number check
    const serialNumber = serial && parseInt(serial);
    if (serial && typeof serialNumber != "number") {
      throw createError(400, "Invalid serial number");
    }

    // date valid or not checking
    if (date && !validator.isISO8601(date)) {
      throw createError(
        400,
        "invalid date format. please provide a valid date."
      );
    }

    // month valid or not checking
    if (month && !validator.isISO8601(month)) {
      throw createError(
        400,
        "invalid month format. please provide a valid month."
      );
    }

    // id query find
    if (id) {
      const invoice = await soldInvoiceCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!invoice) {
        throw createError(404, "invoice not found");
      }
      res.status(200).send({
        success: true,
        message: "invoice retrieved successfully",
        data: invoice,
      });
    }

    // serial number query find
    if (serial) {
      const invoice = await soldInvoiceCollection.findOne({
        fr_id: serialNumber,
      });
      if (!invoice) {
        throw createError(404, "invoice not found");
      }
      res.status(200).send({
        success: true,
        message: "invoice retrieved Successfully",
        data: invoice,
      });
    }

    // date query filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const invoices = await soldInvoiceCollection
        .find({ createdAt: { $gte: startOfDay, $lte: endOfDay } })
        .sort({ createdAt: 1 })
        .toArray();

      if (invoices.length == 0) {
        res.status(404).send({
          success: false,
          message: `no invoice found for the specified date: ${date}`,
        });
      }
      res.status(200).send({
        success: true,
        message: "invoice retrieved successfully",
        data: invoices,
      });
    }

    if (month) {
      const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
      const endOfMonth = new Date(
        new Date(startOfMonth).setUTCMonth(startOfMonth.getUTCMonth() + 1) - 1
      );

      const invoices = await soldInvoiceCollection
        .find({
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        })
        .sort({ createdAt: 1 })
        .toArray();

      const dailyTotals = {};
      const staffSellRecord = {};

      // Process invoices to calculate daily totals and staff sell record
      invoices.forEach((invoice) => {
        const invoiceDate = invoice.createdAt.toISOString().split("T")[0];

        // Calculate daily totals
        if (!dailyTotals[invoiceDate]) {
          dailyTotals[invoiceDate] = {
            daily_sell: 0,
            daily_discount: 0,
          };
        }

        dailyTotals[invoiceDate].daily_sell += invoice.total_bill;
        dailyTotals[invoiceDate].daily_discount += invoice.total_discount;

        // Calculate staff sell record
        const servedBy = invoice.served_by;
        if (!staffSellRecord[servedBy]) {
          staffSellRecord[servedBy] = {};
        }

        staffSellRecord[servedBy][invoiceDate] =
          (staffSellRecord[servedBy][invoiceDate] || 0) + invoice.total_bill;
      });

      // Convert dailyTotals object to an array
      const dailyTotalsArray = Object.entries(dailyTotals).map(
        ([date, totals]) => ({
          createdDate: date,
          ...totals,
        })
      );

      // Convert staffSellRecord object to an array
      const staffSellRecordArray = Object.entries(staffSellRecord).map(
        ([staff, sellRecord]) => ({
          staff,
          sellRecord: Object.entries(sellRecord).map(([date, sum]) => ({
            createdAt: date,
            sum,
          })),
        })
      );

      // Find max and min totals
      const maxSell = Math.max(
        ...dailyTotalsArray.map((totals) => totals.daily_sell)
      );
      const maxSellDate = dailyTotalsArray.find(
        (totals) => totals.daily_sell === maxSell
      ).createdDate;

      const minSell = Math.min(
        ...dailyTotalsArray.map((totals) => totals.daily_sell)
      );
      const minSellDate = dailyTotalsArray.find(
        (totals) => totals.daily_sell === minSell
      ).createdDate;

      res.status(200).send({
        success: true,
        message: "invoices and daily totals retrieved successfully",
        invoices,
        dailySellSummary: dailyTotalsArray,
        minMaxSummary: { maxSellDate, maxSell, minSellDate, minSell },
        staffSellRecord: staffSellRecordArray,
      });
    }
  } catch (error) {
    next(error);
  }
};

export { handleCreateSoldInvoice, handleGetSoldInvoiceByQuery };
