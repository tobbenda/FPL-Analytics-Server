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
  const gwPlayers = [];
  for (let i = 0; i < 1; i++) {
    //gwData.gwBootstrapElements.length;
    const bootstrapElementsCleaned = chooseKeys(
      gwData.gwBootstrapElements,
      bootstrapElementKeysToKeep
    );
    gwPlayers.push(bootstrapElementsCleaned);
  }
  return gwPlayers;
};

const initWithCleanedBootstrapElements = async (client, gw) => {
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
    await initWithCleanedBootstrapElements(client, gw);
  }
};

const stringToDouble = async (client) => {
  const c = client;
  const gw = 13;
  const { elements } = await client.db().collection("gws").findOne({ gw: gw });
  for (let i = 0; i < elements.length; i++) {
    await client
      .db()
      .collection("gws")
      .updateOne(
        { gw: gw },
        {
          $set: {
            "elements.selected_by_percent": parseFloat(
              elements[i].selected_by_percent
            ),
          },
        }
      );
  }
};
useDB(stringToDouble);

// useDB(initDB);
// useDB(initWithCleanedBootstrapElements);

const addSomething = async (client) => {
  await client
    .db()
    .collection("gws")
    .insertOne({ name: "test", gw: 2, bongo: 69 });
};
// useDB(addSomething)
