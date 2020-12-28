const { MongoClient } = require("mongodb");
require("dotenv").config();
const { useDB } = require("./connect");
const { bootstrapElementKeysToKeep } = require("./helpers");

const getLatestDbGw = async (client) => {
  const details = await client.db().collection("details").findOne();
  return details.latestGW;
};

const createElementsCollection = async (client, gw) => {
  const { gwBootstrapElements } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw });
  const elements = gwBootstrapElements;
  const ids = elements.map((el) => el.id);
  for (let i = 0; i < elements.length; i++) {
    await createEl(client, elements[i]);
  }
};

const populateElementsData = async (client, gw) => {
  const { gwBootstrapElements } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw });
  const elements = gwBootstrapElements;
  const { element_summaries } = await client
    .db()
    .collection("gwsRaw")
    .findOne({ gw: gw });
  // Should just get all the data, create everything on the server, and then updateMany. This is SLOW.
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

// Could be improved. throws shitloads of errors and takes forever, but seems to do the job.
const addFieldsBasedOnInternalCalc = async (client, gw) => {
  await client
    .db("fpl")
    .collection("elements")
    .find()
    .forEach(async (el) => {
      const points = el.bootstrap_total_points.find((el) => el.gw == gw).value;
      const cost = el.bootstrap_now_cost.find((el) => el.gw == gw).value;
      const pointsPrGame = el.bootstrap_points_per_game.find(
        (el) => el.gw == gw
      ).value;
      console.log(el.web_name, points, cost, pointsPrGame, "gw: ", gw);
      await client
        .db()
        .collection("elements")
        .updateOne(
          { id: el.id },
          {
            $push: {
              points_pr_mill: {
                gw: gw,
                value: (points * 10) / cost || 0,
              },
              points_pr_game_pr_mill: {
                gw: gw,
                value: (pointsPrGame * 10) / cost || 0,
              },
            },
          }
        );
    });
};

const createElements = async (client) => {
  const gw = await getLatestDbGw(client);
  await createElementsCollection(client, 1);
  for (let i = 1; i <= gw; i++) {
    await populateElementsData(client, i);
    await addFieldsBasedOnInternalCalc(client, i);
  }
  await addLatestElements(client);
};
useDB(createElements);
// const deleteAllDataForCertainGw = async (client, gw = 15) => {
//   const elementsData = await client
//     .db("fpl")
//     .collection("elements")
//     .find({ bootstrap_assists: { $elemMatch: { gw: gw } } })
//     .project({ _id: 0, id: 1 })
//     .toArray();
//   elementsData.forEach((el) => {
//     for (const prop in el) {
//       if (Array.isArray(el[prop])) {
//         if (el[prop].find((x) => x.gw === 15)) {
//           console.log("yolo", el.id);
//         }
//       }
//     }
//   });
//   console.log(elementsData);
// };
// useDB(deleteAllDataForCertainGw);
