const request = require("request");
const { setLatestElements } = require("../setInitial/latestElements");
const { initElements } = require("../setInitial/elements");

const getBootStrapData = async () => {
  const url = "http://fantasy.premierleague.com/api/bootstrap-static/";
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (err, res, body) => {
      if (err) {
        console.log("Error fetching bootstrap static in getLastFinishedGW");
        reject(err);
      }
      if (!err && res.statusCode == 200) {
        resolve(body);
      }
    });
  });
};

const getLatestBootstrapGw = async () => {
  const bootstrapData = await getBootStrapData();
  const events = bootstrapData.events;
  for (let i = 0; i < events.length; i++) {
    if (events[i].finished == false) {
      return events[i].id - 1;
    }
  }
};

const getBootstrapElementsAndTeams = async () => {
  const obj = {};
  const bootstrapData = await getBootStrapData();
  obj.bootstrapElements = bootstrapData.elements;
  obj.bootstrapTeams = bootstrapData.teams;
  return obj;
};

const getGwLiveElements = (gw) => {
  const url = `https://fantasy.premierleague.com/api/event/${gw}/live/`;
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (error, res, body) => {
      if (error) {
        reject(error);
      }
      if (!error && res.statusCode == 200) {
        const elements = body.elements;
        resolve(elements);
      }
    });
  });
};

const getOneElementGWSummary = (playerID, gw) => {
  const url = `https://fantasy.premierleague.com/api/element-summary/${playerID}/`;
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (error, res, body) => {
      if (error) {
        reject(error);
      }
      if (!error && res.statusCode == 200) {
        const specificGW = body.history.find((el) => el.round == gw);
        resolve(specificGW);
      }
    });
  });
};

const getGwElementSummaries = async (gw, ids) => {
  const gwPlayerSummaries = [];
  for (let i = 0; i < ids.length; i++) {
    const playerSummary = await getOneElementGWSummary(ids[i], gw);
    gwPlayerSummaries.push(playerSummary);
  }
  return gwPlayerSummaries;
};

const getTimeStamp = () => {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getMonth();
  const hour = date.getUTCHours();
  const min = date.getUTCMinutes();
  const stringDate = `${day}/${month + 1}/${hour}:${min}`;
  return stringDate;
};

const convertAllPropsOfObjectFromStringToFloat = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] == "string" && !isNaN(obj[key]) && obj[key] !== "") {
      obj[key] = parseFloat(obj[key]);
    }
  }
};

const getNewDataAndUpdate = async (latestBootstrapGw, client) => {
  const gwLiveElements = await getGwLiveElements(latestBootstrapGw);
  const gwElementSummaries = await getGwElementSummaries(
    latestBootstrapGw,
    gwLiveElements.map((el) => el.id)
  );
  const {
    bootstrapElements,
    bootstrapTeams,
  } = await helpers.getBootstrapElementsAndTeams();
  bootstrapElements.forEach(convertAllPropsOfObjectFromStringToFloat);
  gwElementSummaries.forEach(convertAllPropsOfObjectFromStringToFloat);
  gwLiveElements.forEach((el) =>
    convertAllPropsOfObjectFromStringToFloat(el.stats)
  );

  await client.db("fpl").collection("gwsRaw").insertOne({
    gw: latestBootstrapGw,
    event_live_elements: gwLiveElements,
    element_summaries: gwElementSummaries,
    gwBootstrapTeams: bootstrapTeams,
    gwBootstrapElements: bootstrapElements,
  });
  const time = getTimeStamp();
  await client
    .db("fpl")
    .collection("details")
    .updateOne(
      { name: "details" },
      {
        $set: { latestGW: latestBootstrapGw },
        $push: { updateTimes: { gw: latestBootstrapGw, time: time } },
      }
    );
  console.log(
    "bootstrapelements, bootstrapteams, liveElements, elementSummaries created and details updated for gw:",
    latestBootstrapGw
  );
  // await updateElements(client, latestBootstrapGw);
  // await setLatestElements(client);
  //These two should be replaced by bare updating functions, not rebuilding.
  await initElements(client);
  await setLatestElements(client);
};

const getLatestDbGw = async (client) => {
  const details = await client
    .db("fpl")
    .collection("details")
    .findOne({ name: "details" });
  return details.latestGW;
};

module.exports.getLatestBootstrapGw = getLatestBootstrapGw;
module.exports.getBootstrapElementsAndTeams = getBootstrapElementsAndTeams;
module.exports.getLatestDbGw = getLatestDbGw;
module.exports.getGwLiveElements = getGwLiveElements;
module.exports.getOneElementGWSummary = getOneElementGWSummary;
module.exports.getGwElementSummaries = getGwElementSummaries;
module.exports.getTimeStamp = getTimeStamp;
module.exports.getNewDataAndUpdate = getNewDataAndUpdate;
