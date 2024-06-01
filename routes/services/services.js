import { Router } from "express";
import { pool } from "../../config.js";

const router = Router();

function serviceRoute() {
  router.get("/users/all", async (req, res) => {
    //get all posts from DB
    try {
      const query = await pool.query(
        "select first_name,profile_pic,phone,id,email,type from users left join persona on users.id=persona.user_id;"
      );
      res.status(200).send(query.rows);
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  });
  return router;
}

export default serviceRoute;
