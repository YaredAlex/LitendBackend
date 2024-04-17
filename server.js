import passport from "passport";
import express from "express";
import session from "express-session";
import { Strategy } from "passport-local";
import { pool } from "./config.js";
import userRouter from "./routes/users/index.js";
import bcrypt from "bcrypt";
const app = express();

app.use(express.json());
app.use(
  session({
    secret: "random",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 60,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
const userAuth = async (username, password, done) => {
  //perfrom database query and other auth e.g
  let res;
  try {
    res = await pool.query("select * from users where email=$1;", [username]);
  } catch (e) {
    console.log(e);
    done(`${e.message}`, false);
  }
  //check if user exists and check if password matchs
  if (res?.rowCount > 0) {
    const user = res.rows[0];
    //comparePassword
    const validPassword = await bcrypt.compare(password, user.password);
    delete user.password;
    if (validPassword) return done(null, user);
    else done("wrong password", false, { error: "wrong password" });
  } else return done("user not recognized", false);
};
passport.use(
  new Strategy({ usernameField: "email", passwordField: "password" }, userAuth)
);
passport.serializeUser((user, done) => {
  return done(null, { email: user.email });
});
//Deserializer
passport.deserializeUser(async (userEmail, done) => {
  let res;
  try {
    res = await pool.query("select * from users where email=$1;", [
      userEmail.email,
    ]);
  } catch (e) {
    console.log(e.message);
  }

  if (res?.rowCount > 0) return done(null, res.rows[0]);
  return done("unknow user", { user: "unknow" });
});

app.use("/api/user", userRouter());
app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({ error: err });
});
function start() {
  pool
    .connect()
    .then(() => {
      app.listen(8080, () => {
        console.log("server started Successfully");
        console.log("server listen to 8080");
      });
    })
    .catch((e) => {
      console.log("can not starat server!");
      console.log(e);
    });
}
start();
