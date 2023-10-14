import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // id: { type: String, unique: true, lowercase: true, required: true },
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
  },
  phone: { type: String, trim: true, required: true, unique: true },
});

const UserModel = new mongoose.model("Users", userSchema);
export default UserModel;
