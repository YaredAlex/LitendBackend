import { Router, response } from "express";
import { pool } from "../../config.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import { jwt_secret } from "../../constants/constant.js";

function userRouter() {
  const router = Router();
  //check if user if following
  router.get("/profile/following/:user_id/:followed_id", async (req, res) => {
    //check if there is token in the req
    const { followed_id, user_id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "no token" });
    try {
      jwt.verify(token, jwt_secret);
      //get user from db
      const query = await pool.query(
        `SELECT EXISTS (
    SELECT 1
    FROM followers
    WHERE follower_id = $1
    AND followed_id = $2
) AS is_following;`,
        [user_id, followed_id]
      );
      return res.status(200).json(query.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  //follow user
  router.post("/follow", async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { followedId } = req.body;
    if (!token) return res.status(403).json({ error: "token is required" });
    try {
      const { id } = jwt.verify(token, jwt_secret);
      //add follow to table
      try {
        const query = await pool.query(
          "insert into followers (follower_id,followed_id) values($1,$2)",
          [id, followedId]
        );
        return res.status(200).json({ msg: "follow" });
      } catch (e) {
        if (e.code == 23505) {
          const query = await pool.query(
            "delete from followers where follower_id = $1 and followed_id = $2",
            [id, followedId]
          );
          return res.status(200).json({ msg: "unfollow" });
        }
        return res.status(500).json({ error: e.message });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  //getFollower
  router.get("/profile/followers/:id", async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { id } = req.params;
    try {
      jwt.verify(token, jwt_secret);
      //get users followers
      const query = await pool.query(
        "select u.first_name,u.last_name,u.profile_pic,u.id from followers as f inner join users as u on f.follower_id = u.id where f.followed_id = $1",
        [id]
      );
      res.status(200).json(query.rows);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: e.message });
    }
  });
  //get profile by Id
  router.get("/profile/:id", async (req, res) => {
    //check if there is token in the req
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "no token" });
    const { id } = req.params;
    try {
      jwt.verify(token, jwt_secret);

      //get user from db
      const query = await pool.query(
        `SELECT 
    u.first_name,
    u.id,
    u.last_name,
    u.email , 
    u.profile_pic,
    COUNT(DISTINCT p.id) AS post_count,
    COUNT(DISTINCT f1.follower_id) AS follower_count,
    COUNT(DISTINCT f2.followed_id) AS following_count
FROM 
    users u
LEFT JOIN 
    posts p ON u.id = p.user_id
LEFT JOIN 
    followers f1 ON u.id = f1.followed_id
LEFT JOIN 
    followers f2 ON u.id = f2.follower_id
WHERE 
    u.id = $1
GROUP BY 
    u.id;`,
        [id]
      );
      return res.status(200).json(query.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  //get followers
  router.get("/profile/follwers/:id", async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    try {
      jwt.verify(token, jwt_secret);
      const query = await pool.query(
        "select first_name,last_name,profile_pic from users as u inner join followers as f on u.id = f.follower_id where f.followed_id = $1;",
        [id]
      );
      res.status(200).json(query.rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  //get selfProfile
  router.get("/profile", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "no token" });
    try {
      const decoded = jwt.verify(token, jwt_secret);
      const { id } = decoded;
      //get user from db
      const query = await pool.query(
        `SELECT 
    u.first_name,
    u.last_name,
    u.email , 
    u.id,
    u.profile_pic,
    COUNT(DISTINCT p.id) AS post_count,
    COUNT(DISTINCT f1.follower_id) AS follower_count,
    COUNT(DISTINCT f2.followed_id) AS following_count
FROM 
    users u
LEFT JOIN 
    posts p ON u.id = p.user_id
LEFT JOIN 
    followers f1 ON u.id = f1.followed_id
LEFT JOIN 
    followers f2 ON u.id = f2.follower_id
WHERE 
    u.id = $1
GROUP BY 
    u.id;`,
        [id]
      );

      return res.status(200).json(query.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  //posting image
  router.post("/post/img-post", async (req, res) => {
    try {
      const { imgUrl } = req.body;
      const token = req.headers.authorization?.split(" ")[1];

      const { id } = jwt.verify(token, jwt_secret);
      console.log("user id is ", id);
      //saving to database
      const query = await pool.query(
        "insert into posts (user_id,media_url,likes) values($1,$2,$3) returning *;",
        [id, imgUrl, 0]
      );
      console.log(query.rows);
      return res.status(200).json({ msg: "success" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: `error ${e.message}` });
    }
  });
  router.post("/post/profile", async (req, res) => {
    try {
      const { imgUrl } = req.body;
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        //Do some thing
      }
      const { id } = jwt.verify(token, jwt_secret);
      //saving to database
      const query = await pool.query(
        "update users set profile_pic=$1 where id=$2 returning *;",
        [imgUrl, id]
      );
      return res.status(200).json({ msg: "success" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: `error ${e.message}` });
    }
  });
  router.get("/post/all", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return response.status(401).json({ msg: "unauthorized" });
      }
      const { id } = jwt.verify(token, jwt_secret);
      //saving to database
      const query = await pool.query(
        "select * from posts where user_id=$1 order by post_date;",
        [id]
      );
      return res.status(200).send(query.rows);
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: `error ${e.message}` });
    }
  });
  router.delete("/post/:id", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return response.status(401).json({ msg: "unauthorized" });
      }
      const { id } = req.params;
      //saving to database
      const query = await pool.query("delete from posts where id=$1;", [id]);
      return res.status(200).json({ msg: "success" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: `error ${e.message}` });
    }
  });

  return router;
}

export default userRouter;
