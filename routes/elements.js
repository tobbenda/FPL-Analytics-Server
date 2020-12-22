const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("elements HIT");
  res.end("elements");
});

module.exports = router;
