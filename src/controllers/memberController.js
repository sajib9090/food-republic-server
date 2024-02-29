import createError from "http-errors";
import { ObjectId } from "mongodb";
import { memberCollection } from "../collections/collections.js";
import validator from "validator";

const handleCreateMember = async (req, res, next) => {
  const { name, mobile } = req.body;
  try {
    if (!name || !mobile) {
      throw createError(400, "name and mobile are required");
    }

    const trimmedName = name.toLowerCase().trim().replace(/\s+/g, " ");

    if (trimmedName.length < 3) {
      throw createError(400, "name must be at least 3 characters long");
    }

    if (/^\d/.test(trimmedName)) {
      throw createError(400, "name cannot start with a number");
    }

    if (/^[^a-zA-Z0-9]/.test(trimmedName)) {
      throw createError(400, "name cannot start with a special character");
    }

    if (mobile.length != 11) {
      throw createError(400, "mobile number should be 11 characters");
    }

    if (!validator.isMobilePhone(mobile, "bn-BD")) {
      throw createError(400, "invalid bangladeshi mobile number");
    }

    const exists = await memberCollection.findOne({ mobile });
    if (exists) {
      throw createError(400, "member already exists");
    }
    const countDoc = await memberCollection.countDocuments();

    const newMember = await memberCollection.insertOne({
      member_serial: countDoc + 1,
      name: trimmedName,
      mobile: mobile,
      discountValue: 10,
      total_discount: 0,
      total_spent: 0,
      invoices_code: [],
      createdAt: new Date(),
    });

    res.status(200).send({
      success: true,
      message: "member created successfully",
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetMembers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;

    const regExSearch = new RegExp(".*" + search + ".*", "i");

    // necessary filter
    const filter = {
      $or: [
        { name: { $regex: regExSearch } },
        { mobile: { $regex: regExSearch } },
      ],
    };

    const members = await memberCollection
      .find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray();

    const count = await memberCollection.find(filter).count();

    // Response
    res.status(200).send({
      success: true,
      message: "members retrieved successfully",
      members,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previousPage: page - 1 > 0 ? page - 1 : null,
        nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleMemberByMobile = async (req, res, next) => {
  const { mobile } = req.params;
  try {
    if (mobile.length != 11) {
      throw createError(400, "mobile number should be 11 characters");
    }

    if (!validator.isMobilePhone(mobile, "bn-BD")) {
      throw createError(400, "invalid bangladeshi mobile number");
    }

    const exists = await memberCollection.findOne({ mobile });
    if (!exists) {
      throw createError(404, "member not found");
    }

    res.status(200).send({
      success: true,
      message: "member retrieved successfully",
      data: exists,
    });
  } catch (error) {
    next(error);
  }
};

const handleEditInformationByMobile = async (req, res, next) => {
  const { mobile } = req.params;
  const updatedData = req.body;

  try {
    if (mobile.length !== 11) {
      throw createError(400, "mobile number should be 11 characters");
    }

    if (!validator.isMobilePhone(mobile, "bn-BD")) {
      throw createError(400, "invalid Bangladeshi mobile number");
    }

    const existingMember = await memberCollection.findOne({ mobile });
    if (!existingMember) {
      throw createError(404, "member not found");
    }

    if (Object.keys(updatedData).length === 0) {
      throw createError(400, "no fields provided for update");
    }

    if (updatedData.mobile && updatedData.mobile !== mobile) {
      throw createError(
        400,
        "mobile cannot be changed. already exists same mobile"
      );
    }

    const updatedMember = await memberCollection.updateOne(
      { mobile },
      {
        $set: {
          ...updatedData,
          discountValue: parseInt(updatedData.discountValue),
          updatedAt: new Date(),
        },
      }
    );

    if (updatedMember.modifiedCount === 1) {
      res.status(200).send({
        success: true,
        message: "Member information updated successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "No changes made to member information",
      });
    }
  } catch (error) {
    next(error);
  }
};

const handleUpdateMemberData = async (req, res, next) => {
  const { mobile } = req.params;
  const { discount, total_bill, invoice } = req.body;

  try {
    if (mobile.length !== 11) {
      throw createError(400, "mobile number should be 11 characters");
    }

    if (!validator.isMobilePhone(mobile, "bn-BD")) {
      throw createError(400, "invalid Bangladeshi mobile number");
    }

    const existingMember = await memberCollection.findOne({ mobile });
    if (!existingMember) {
      throw createError(404, "member not found");
    }

    if (!discount || !total_bill || !invoice) {
      throw createError(400, "all fields are required");
    }

    const updatedTotalDiscount =
      existingMember.total_discount + (parseFloat(discount) || 0);
    const updatedTotalSpent =
      existingMember.total_spent + (parseFloat(total_bill) || 0);

    if (!ObjectId.isValid(invoice)) {
      throw createError(400, "invalid invoice id.");
    }

    const updatedMember = await memberCollection.updateOne(
      { mobile },
      {
        $set: {
          total_discount: updatedTotalDiscount,
          total_spent: updatedTotalSpent,
          updatedAt: new Date(),
        },
        $push: { invoices_code: invoice },
      }
    );

    if (updatedMember.modifiedCount === 1) {
      res.status(200).send({
        success: true,
        message: "member data updated successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "no changes made to member data",
      });
    }
  } catch (error) {
    next(error);
  }
};

const handleDeleteMemberByMobile = async (req, res, next) => {
  const { mobile } = req.params;
  try {
    if (mobile.length !== 11) {
      throw createError(400, "mobile number should be 11 characters");
    }

    if (!validator.isMobilePhone(mobile, "bn-BD")) {
      throw createError(400, "invalid Bangladeshi mobile number");
    }

    const existingMember = await memberCollection.findOne({ mobile });
    if (!existingMember) {
      throw createError(404, "member not found");
    }
    const deletionResult = await memberCollection.deleteOne({ mobile });

    if (deletionResult.deletedCount === 1) {
      res.status(200).send({
        success: true,
        message: "member deleted successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "no member deleted. an error occurred during deletion.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export {
  handleCreateMember,
  handleGetSingleMemberByMobile,
  handleEditInformationByMobile,
  handleUpdateMemberData,
  handleDeleteMemberByMobile,
  handleGetMembers,
};
