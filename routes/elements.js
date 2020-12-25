const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  const { sortby, posfilter, maxprice, minprice } = req.params;
  const { latestGW } = await db
    .getDb()
    .db("fpl")
    .collection("details")
    .findOne({ name: "details" });
  const gwData = await db
    .getDb()
    .db("fpl")
    .collection("gwsTest")
    .findOne({ gw: latestGW });
  // console.log("yeehaw", one.gw);
  res.end(JSON.stringify({ response: true }));
});

module.exports = router;

const elements = {
  id: 254,
  now_cost: [{ gw: 1, now_cost: 59 }],
};

const elements2 = {
  id: 254,
  gws: [{ gw: 1, now_cost: 59 }],
};
