const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("Teams hit");
  res.end("Teams");
});

module.exports = router;
