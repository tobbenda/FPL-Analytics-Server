const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
require("dotenv").config();
const mongoDbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmqfa.mongodb.net/fpl?retryWrites=true&w=majority`;

let _db;

const initDb = (callback) => {
  if (_db) {
    return callback(null, _db);
  }
  MongoClient.connect(mongoDbUrl, { useUnifiedTopology: true })
    .then((client) => {
      console.log("DB connected..");
      _db = client;
      callback(null, _db);
    })
    .catch((err) => {
      callback(err);
    });
};

const getDb = () => {
  if (!_db) {
    throw Error("Database not initialized");
  }
  return _db;
};

module.exports = {
  initDb,
  getDb,
};
