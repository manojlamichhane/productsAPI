const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./../models/productModel");

dotenv.config();
const port = 3000;

const DB = process.env.DB_CONNECTION_STRING.replace(
  "PASSWORD",
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log("DB connection Success!!"));

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);
console.log("products", products.products);

const deleteandimportData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data deleted with success");
    await Product.create(products.products);
    console.log("Data loaded with success");
  } catch (err) {
    console.log(err);
  }
};

deleteandimportData();
