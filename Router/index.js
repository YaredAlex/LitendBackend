import express from "express";
import ItemModel from "../mongoose/userModel.js";

const ItemsRouting = () => {
  const router = express.Router();
  router.get("/items", async (req, res) => {
    try {
      const result = await ItemModel.find({}).exec();
      console.log(result);
      res.json(result);
    } catch (e) {
      console.log(e);
    }
  });
  router.get("/items/put", async (req, res) => {
    try {
      const newUser = await ItemModel.create({
        id: "1234454",
        f_name: "Yared",
      });
      console.log(newUser);
      res.json(newUser);
    } catch (e) {
      res.json({ message: e.message });
    }
  });
  return router;
};
export default ItemsRouting;
