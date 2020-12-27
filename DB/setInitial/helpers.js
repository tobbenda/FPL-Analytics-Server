const getLatestDbGw = async (client) => {
  const details = await client.db().collection("details").findOne();
  return details.latestGW;
};

module.exports.getLatestDbGw = getLatestDbGw;
