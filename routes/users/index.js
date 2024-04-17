import { Router } from "express";
import passport from "passport";
import { validateRegister } from "../../services/controller/auth.js";
import { pool } from "../../config.js";
import {
  sendEmail,
  sendEmailOTP,
} from "../../services/controller/sendEmail.js";
import bcrypt from "bcrypt";
import { generateOTP } from "../../services/controller/otp.js";
import jwt, { decode } from "jsonwebtoken";
const router = Router();
function userRouter() {
  //Login user
  router.post(
    "/login",
    async (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.log("error while login");
          return next(err);
        }
        if (!user) {
          return next(info["message"]);
        }
        req.user = user;
        return next();
      })(req, res, next);
    },
    (req, res) => {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        "gutentag",
        {
          expiresIn: 1000 * 60 * 60 * 60 * 24,
        }
      );
      return res.status(200).json({ msg: "success", ...req.user, token });
    }
  );
  //Register user
  router.post("/register", async (req, res, next) => {
    const userData = req.body;
    const validateInput = validateRegister(userData);
    // passport.authenticate("locale");
    if (validateInput.valid) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const query = await pool.query(
          "insert into users(first_name,last_name,email,password) values($1,$2,$3,$4) returning *;",
          [
            userData.first_name,
            userData.last_name,
            userData.email,
            hashedPassword,
          ]
        );
        //getting user id
        const id = query.rows[0].id;
        const token = jwt.sign({ id: id, email: userData.email }, "gutentag");
        //sending email welcome email
        try {
          sendEmail(userData.email, "welcome to litend");
        } catch (e) {
          console.log("error while sending email", e);
        }

        return res.status(200).json({
          token: token,
          msg: "registered successfuly",
        });
      } catch (e) {
        let error = "error while register";
        if (e.constraint == "users_email_key") {
          error = "email allready exist";
        }

        return next(error);
      }
    }
    return res.status(500).json(validateInput);
  });
  //send userProfile
  router.post("/profile", async (req, res, next) => {
    //check if there is token in the req
    const { token } = req.body;
    if (!token) return res.status(500).json({ error: "no token" });
    try {
      const decoded = jwt.verify(token, "gutentag");
      //get user from db
      const query = await pool.query(
        "select id, first_name,last_name,email from users where id=$1",
        [decoded.id]
      );
      return res.status(200).json({ msg: "success", ...query.rows[0] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  //send Verification code
  router.post("/send-otp", async (req, res) => {
    try {
      const { email, token } = req.body;
      if (!email) return res.status(500).json({ error: "email is required" });
      if (!token) return res.status(500).json({ error: "token is required" });
      //verify token
      const decoded = jwt.verify(token, "gutentag");
      const otp = generateOTP(5);
      //save otp to database
      const query = await pool.query(
        "insert into otps values($1,$2) returning *",
        [decoded.id, otp]
      );
      console.log(query.rows);
      // req.session.otp = otp;
      await sendEmailOTP(email, otp);
      return res.status(200).json({ msg: "OTP sent" });
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ error: e.message });
    }
  });
  //Verify user OTP
  router.post("/verify-otp", async (req, res) => {
    // if (!req.session?.passport?.user)
    //   return res.status(500).json({ error: "unautherized" });
    console.log(req.body);
    const token = req.body.token;
    if (!token) return res.status(500).json({ error: "missing token" });
    let decoded = null;
    try {
      decoded = jwt.verify(token, "gutentag");
      console.log(decoded);
    } catch (e) {
      console.log(e);
      return res.sendStatus(500).json({ error: "Invalid token" });
    }
    const query = await pool.query(
      "select otp from otps where id=$1 order by created_at desc limit 1;",
      [decoded?.id]
    );
    const otp_db = query.rows[0]?.otp;
    const { otp_code } = req.body;
    if (!otp_code) return res.status(500).json({ error: "OTP is required" });
    try {
      console.log("user otp is", otp_code, "session otp is", otp_db);
      console.log("user is ", req.user);
      if (otp_code == otp_db) {
        const change = await pool.query(
          "update users set is_verified=true where id=$1 returning *;",
          [decoded.id]
        );
        console.log("change are ", change.rows);
        return res.status(200).json({ msg: "otp is verified" });
      } else return res.status(500).json({ error: "otp doesn't match" });
    } catch (e) {
      console.log("error while saving user", e.message);
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}

export default userRouter;