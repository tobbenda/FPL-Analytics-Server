const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  const { sortby, posfilter, maxprice, minprice } = req.params;
  console.log("elements HIT");
  res.end(JSON.stringify({ response: true }));
});

module.exports = router;
