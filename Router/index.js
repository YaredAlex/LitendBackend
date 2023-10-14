import express from "express";
import UserModel from "../mongoose/userModel.js";
import UserService from "../service/userService.js";

const ItemsRouting = () => {
  const router = express.Router();
  // router.get("/items", async (req, res) => {
  //   try {
  //     const result = await UserModel.find({}).exec();
  //     console.log(result);
  //     res.json(result);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });
  router.get("/admin/users/get/:param", async (req, res) => {
    try {
      const result = await UserService.getUser(param);
      console.log(result, " ==> ", param);
    } catch (e) {
      console.log(e);
    }
  });
  router.post("/admin/users/add", async (req, res) => {
    const record = req.body;
    console.log(record);
    try {
      const result = await UserService.create({
        name: record?.name,
        email: record?.email,
        phone: record?.phone,
      });
      console.log(result);
      res.json({ message: "success" });
    } catch (e) {
      console.log(e);
      console.log(
        e.errors?.name?.properties.message ||
          e.errors?.email?.properties.message ||
          e.errors?.phone?.properties.message,
        " Getting error"
      );
      res.json({
        message:
          e.errors?.name?.properties.message ||
          e.errors?.email?.properties.message ||
          e.errors?.phone?.properties.message ||
          "Email or phone Existes",
      });
    }
  });
  return router;
};
export default ItemsRouting;
