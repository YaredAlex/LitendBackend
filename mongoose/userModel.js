import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  id: { type: String, unique: true, lowercase: true, required: true },
  f_name: { type: String, lowercase: true, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
});

const ItemModel = mongoose.model("customers", userSchema);

export default ItemModel;
