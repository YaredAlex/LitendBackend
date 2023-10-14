import express from "express";
import mongoose from "mongoose";
import ItemsRouting from "./Router/index.js";
import "dotenv/config.js";
const app = express();
const urlMongoose = `mongodb+srv://yared:${process.env.MONGO_PASS}@cluster0.lz9kfey.mongodb.net/react_with_mongo?retryWrites=true&w=majority`;
const port = process.env.PORT || 8000;
app.use("/", ItemsRouting());
//Connect to Mongoose
async function makeConnection() {
  try {
    const db = await mongoose.connect(urlMongoose, {
      useNewUrlParser: true,
    });
    console.log("you are connected to mongoosed ");
    console.log("-------------------------------");
    app.listen(port, () => {
      console.log(`Server listening ${port}`);
    });
  } catch (e) {
    console.log("error occured ", e);
  }
}
makeConnection();
