const { MongoClient } = require("mongodb");
const helpers = require("./helpers");
require("dotenv").config();
const {
  getLatestDbGw,
  getTimeStamp,
  getNewDataAndUpdate,
} = require("./helpers");

const updateDB = async () => {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmqfa.mongodb.net/fpl?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const latestDbGw = await getLatestDbGw(client);
    const latestBootstrapGw = await helpers.getLatestBootstrapGw();
    if (latestBootstrapGw > latestDbGw) {
      console.log("New Gameweek to update!");
      await getNewDataAndUpdate(latestBootstrapGw, client, latestBootstrapGw);
    } else {
      console.log("Not a new gameweek finished yet");
      const time = getTimeStamp();
      await client
        .db("fpl")
        .collection("details")
        .updateOne(
          { name: "details" },
          { $push: { updateChecks: { time: time } } }
        );
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};
updateDB();

module.exports.updateDB = updateDB;
