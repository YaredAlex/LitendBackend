import { Router } from "express";
import { pool } from "../../config.js";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../../constants/constant.js";
const router = Router();

function postRouter() {
  router.get("/all", async (req, res) => {
    //get all posts from DB
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "unauthorized" });
    }

    try {
      const query = await pool.query(
        "select posts.id as postId,users.id,post_date,media_url,likes, first_name,profile_pic,likes from users join posts on posts.user_id = users.id order by posts.post_date;"
      );
      res.status(200).send(query.rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  router.put("/like/:postId", async (req, res) => {
    //get all posts from DB
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "unauthorized" });
    }

    try {
      const { id } = jwt.verify(token, jwt_secret);
      console.log("liker id", id);
      const { postId } = req.params;
      const query = await pool.query("insert into likes values($1,$2)", [
        postId,
        id,
      ]);
      console.log(query.rows);
      res.status(200).json({ msg: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  //post reply
  router.post("/post/replies", async (req, res) => {
    const { post_id, reply_text } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "unauthorized" });
    }
    if (!post_id || !reply_text) {
      return res
        .status(400)
        .json({ error: "post_id and reply_text are required" });
    }

    try {
      const { id } = jwt.verify(token, jwt_secret);
      const result = await pool.query(
        "INSERT INTO post_replies (post_id, replier_id, reply_text, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [post_id, id, reply_text]
      );

      res.status(200).json(result.rows[0]);
    } catch (e) {
      console.error("Error inserting reply:", e);
      res.status(500).json({ error: `${e.message}` });
    }
  });

  // getRepliest
  router.get("/replies/:postId", async (req, res) => {
    const { postId } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "unauthorized" });
    }
    try {
      jwt.verify(token, jwt_secret);
      const result = await pool.query(
        "SELECT * FROM post_replies WHERE post_id = $1 ORDER BY timestamp DESC",
        [postId]
      );
      res.status(200).json(result.rows);
    } catch (e) {
      console.error("Error getting replies:", e);
      res.status(500).json({ error: `${e.message}` });
    }
  });
  return router;
}

export default postRouter;
