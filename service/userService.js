import UserModel from "../mongoose/userModel.js";
class UserService {
  static async getUser(param) {
    await UserModel.find({ email: param }, (err, doc) => {
      if (err) {
        return err;
      } else return doc;
    });
  }
  static async create(params) {
    return await UserModel.create(params);
  }
}

export default UserService;
