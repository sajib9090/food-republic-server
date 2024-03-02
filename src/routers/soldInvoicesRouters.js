import express from "express";
import { isLoggedIn } from "../middlewares/auth.js";
import {
  handleCreateSoldInvoice,
  handleGetSoldInvoiceByQuery,
} from "../controllers/soldInvoicesController.js";

const soldInvoicesRouter = express.Router();

soldInvoicesRouter.post("/add", isLoggedIn, handleCreateSoldInvoice);
soldInvoicesRouter.get("/query", handleGetSoldInvoiceByQuery);

export default soldInvoicesRouter;
