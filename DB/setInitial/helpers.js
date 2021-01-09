const { useDB } = require("./connect");
require("dotenv").config();

const getLatestDbGw = async (client) => {
  const details = await client.db().collection("details").findOne();
  return details.latestGW;
};

const getKeysForLatestElements = async (client) => {
  const details = await client.db().collection("elements").findOne({ id: 254 });
  console.log(Object.keys(details));
};

// useDB(getKeysForLatestElements);

module.exports.getLatestDbGw = getLatestDbGw;
