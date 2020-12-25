const { buildExecutionContext } = require("graphql/execution/execute");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { useDB } = require("./connect");
const { bootstrapElementKeysToKeep } = require("./helpers");

// const chooseKeys = (objects, keysToKeep) => {
//   const trimmedObjects = objects.map((el) => {
//     const newElement = {};
//     keysToKeep.forEach((key) => {
//       newElement[key] = el[key];
//     });
//     return newElement;
//   });
//   return trimmedObjects;
// };

const createElementsCollection = async (client, gw) => {
  const { gwBootstrapElements } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw });
  const elements = gwBootstrapElements;
  const ids = elements.map((el) => el.id);
  for (let i = 0; i < elements.length; i++) {
    // const el = await client
    //   .db()
    //   .collection("elements")
    //   .findOne({ id: elements[i].id });
    // if (!el) {
    await createEl(client, elements[i]);
    // }
  }
};

// useDB(createElementsCollection);

const createEl = async (client, elementData) => {
  await client.db().collection("elements").insertOne({
    code: elementData.code,
    elements_type: elementData.element_type,
    first_name: elementData.first_name,
    id: elementData.id,
    second_name: elementData.second_name,
    team: elementData.team,
    team_code: elementData.team_code,
    web_name: elementData.web_name,
  });
};
const queryDynamic = async (client) => {
  const query = { id: 1 };
  const doThis = { $push: { testArr: { gw: 1, value: "test" } } };
  await client.db().collection("elements").updateOne(query, doThis);
};

const getUpdateQ = (elementData, keys, gw, source) => {
  const q = {};
  for (let i = 0; i < keys.length; i++) {
    q[source + keys[i]] = { gw: gw, value: elementData[keys[i]] };
  }
  return q;
};

const addGwBootstrapDataForEl = async (client, gw, elementData) => {
  const keys = Object.keys(elementData);
  const updateQ = getUpdateQ(elementData, keys, gw, "bootstrap_");
  await client
    .db()
    .collection("elements")
    .updateOne({ id: elementData.id }, { $push: updateQ });
};

const addGwSummaryDataForEl = async (client, gw, element_summary) => {
  const keys = element_summary ? Object.keys(element_summary) : null;
  if (!keys) {
    return;
  }
  const updateQ = getUpdateQ(element_summary, keys, gw, "");
  await client
    .db()
    .collection("elements")
    .updateOne({ id: element_summary.element }, { $push: updateQ });
};

const populateElementsData = async (client, gw = 1) => {
  const { gwBootstrapElements } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw });
  const elements = gwBootstrapElements;
  const { element_summaries } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw });

  for (let i = 0; i < elements.length; i++) {
    const el = await client
      .db()
      .collection("elements")
      .findOne({ id: elements[i].id });
    if (!el) {
      await createEl(client, elements[i]);
    }
    await addGwBootstrapDataForEl(client, gw, elements[i]);
    await addGwSummaryDataForEl(client, gw, element_summaries[i]);
  }
};

// useDB(populateElementsData);

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
    // await initWithCleanedBootstrapElements(client, i);
    // await addFieldsBasedOnInternalCalc(client, i);
    i == 1 ? await createElementsCollection(client, i) : null;
    await populateElementsData(client, i);
  }
};

// useDB();
// useDB(initDB);

const addFieldsBasedOnInternalCalc = async (client, gw) => {
  await client
    .db()
    .collection("gws")
    .updateOne({ gw: gw }, [
      {
        $set: {
          elements: {
            $map: {
              input: "$elements",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    points_pr_mill: {
                      $divide: ["$$this.total_points", "$$this.now_cost"],
                    },
                    points_pr_game_pr_mill: {
                      $divide: ["$$this.points_per_game", "$$this.now_cost"],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);
};

// Not in use
const addLastMatchStats = async (client, gw) => {
  gw = 5;
  if (gw == 1) {
    // prevent adding
  }
  const { elements } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw - 1 });
  for (let i = 0; i < elements.length; i++) {
    await client
      .db()
      .collection("gwsTest")
      .updateOne(
        { gw: gw, elements: { $elemMatch: { id: elements[i].id } } },
        { $set: getNewStatsObj(elements[i]) }
      );
  }
};

// Not in use
const getNewStatsObj = (element) => {
  const updateObject = {
    "elements.$.points_pr_mill": getPointsPrMill(element),
    "elements.$.points_pr_game_pr_mill": getPointsPrGamePrMill(element),
    "elements.$.points_last_game": "not implemented",
  };
  return updateObject;
};
// Not in use
const getPointsPrMill = (element) => {
  return element.total_points / element.now_cost;
};
// Not in use
const getPointsPrGamePrMill = (element) => {
  return element.points_per_game / element.now_cost;
};
