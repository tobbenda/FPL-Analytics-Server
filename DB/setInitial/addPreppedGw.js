const { buildExecutionContext } = require("graphql/execution/execute");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { useDB } = require("./connect");
const { bootstrapElementKeysToKeep } = require("./helpers");

const chooseKeys = (objects, keysToKeep) => {
  const trimmedObjects = objects.map((el) => {
    const newElement = {};
    keysToKeep.forEach((key) => {
      newElement[key] = el[key];
    });
    return newElement;
  });
  return trimmedObjects;
};

const createGwPlayers = (gwData) => {
  const bootstrapElementsCleaned = chooseKeys(
    gwData.gwBootstrapElements,
    bootstrapElementKeysToKeep
  );
  const cleanedAndCorrectTypes = bootstrapElementsCleaned.map((el) => {
    const newObj = {};
    for (const prop in el) {
      if (
        !isNaN(el[prop]) &&
        el[prop] != null &&
        el[prop] != "true" &&
        el[prop] != "false"
      ) {
        newObj[prop] = parseFloat(el[prop]);
      } else {
        newObj[prop] = el[prop];
      }
    }
    return newObj;
  });
  return cleanedAndCorrectTypes;
};

const initWithCleanedBootstrapElements = async (client, gw) => {
  console.log("initWithCleand: ", gw);
  let gwData;
  await client
    .db()
    .collection("gwsRaw")
    .find({ gw: gw })
    .forEach((el) => {
      gwData = el;
    });
  const cleanedBootstrapElements = createGwPlayers(gwData);
  await client
    .db()
    .collection("gws")
    .insertOne({ gw: gw, elements: cleanedBootstrapElements });
};

const getLatestDbGw = async (client) => {
  const details = await client.db().collection("details").findOne();
  return details.latestGW;
};

const initDB = async (client) => {
  const gw = await getLatestDbGw(client);
  for (let i = 1; i <= gw; i++) {
    await initWithCleanedBootstrapElements(client, i);
  }
};

const addCustomStatsForGw = async (client) => {
  gw = 3;
  const { elements } = await client
    .db()
    .collection("gwsTest")
    .findOne({ gw: gw });
  await addPointsPrMill(client, elements);
};
useDB(addCustomStatsForGw);
// db.gwsTest.updateMany({elements:{$elemMatch:{id:254, goals_scored:{$gte:6}}}},{$set:{"elements.$.quote":"I am Salah with more than 5 goals"}})

const addPointsPrMill = async (client, elements) => {
  for (let i = 0; i < elements.length; i++) {
    // const points_pr_mill = elements[i].total_points / elements[i].now_cost;
    await client
      .db()
      .collection("gwsTest")
      .updateOne(
        { gw: gw, elements: { $elemMatch: { id: elements[i].id } } },
        { $set: getNewStats(elements[i]) }
      );
  }
};
const getPointsPrMill = (element) => {
  return element.total_points / element.now_cost;
};
const getPointsPrGamePrMill = (element) => {
  return element.points_per_game / element.now_cost;
};
const getNewStats = (element) => {
  const updateObject = {
    "elements.$.points_pr_mill": getPointsPrMill(element),
    "elements.$.points_pr_game_pr_mill": getPointsPrGamePrMill(element),
  };
  return updateObject;
};

// useDB(initDB);

const addSomething = async (client) => {
  await client
    .db()
    .collection("gws")
    .insertOne({ name: "test", gw: 2, bongo: 69 });
};
