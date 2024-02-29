import { client } from "../config/db.js";

const db_name = "Food";

const menuItemCollection = client.db(db_name).collection("menu-items");
const categoryCollection = client.db(db_name).collection("categories");
const staffCollection = client.db(db_name).collection("staffs");
const usersCollection = client.db(db_name).collection("users");
const tableCollection = client.db(db_name).collection("tables");
const memberCollection = client.db(db_name).collection("members");
const expenseCollection = client.db(db_name).collection("expenses");
const soldInvoiceCollection = client.db(db_name).collection("sold-invoices");

export {
  menuItemCollection,
  categoryCollection,
  staffCollection,
  usersCollection,
  tableCollection,
  memberCollection,
  expenseCollection,
  soldInvoiceCollection,
};
