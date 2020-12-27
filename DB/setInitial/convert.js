require("dotenv").config();
const { useDB } = require("./connect");
const { getLatestDbGw } = require("./helpers");

const convertAllPropsOfObjectFromStringToFloat = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] == "string" && !isNaN(obj[key]) && obj[key] !== "") {
      obj[key] = parseFloat(obj[key]);
    }
  }
};

const convertEventLiveElements = (eventLiveElements) => {
  eventLiveElements.forEach((el) => {
    convertAllPropsOfObjectFromStringToFloat(el.stats);
  });
  return eventLiveElements;
};

const convertElementSummaries = (elementSummaries) => {
  elementSummaries.forEach((el) => {
    convertAllPropsOfObjectFromStringToFloat(el);
  });
  return elementSummaries;
};

const convertGwsRaw = async (client, gw) => {
  const gwsRawData = await client
    .db("fpl")
    .collection("gwsRaw")
    .findOne({ gw: gw });
  const correctTypeEventLiveElements = convertEventLiveElements(
    gwsRawData.event_live_elements
  );
  const correctTypeElementSummaries = convertElementSummaries(
    gwsRawData.element_summaries
  );
  // Not implemented, not currently a problem:
  // correctedBootstrapElements
  // correctedBootstrapTeams
  await client
    .db("fpl")
    .collection("gwsRaw")
    .updateOne(
      { gw: gw },
      {
        $set: {
          event_live_elements: correctTypeEventLiveElements,
          element_summaries: correctTypeElementSummaries,
        },
      }
    );
};

const convertStringsToNumbers = async (client) => {
  const lastGw = await getLatestDbGw(client);
  for (let i = 1; i <= lastGw; i++) {
    await convertGwsRaw(client, i);
  }
};

const convertBootstrapElementsRaw = async (client, gw) => {
  const gwData = await client
    .db("fpl")
    .collection("gwsRaw")
    .findOne({ gw: gw });

  gwData.gwBootstrapElements.forEach(convertAllPropsOfObjectFromStringToFloat);
  await client
    .db("fpl")
    .collection("gwsRaw")
    .updateOne(
      { gw: gw },
      { $set: { gwBootstrapElements: gwData.gwBootstrapElements } }
    );
};

const makeCopyOfGwsRaw = async (client) => {
  const gw1 = await client.db("fpl").collection("gwsRaw").findOne({ gw: 14 });
  await client.db("fpl").collection("gwsRawCopy4").insertOne(gw1);
};

// useDB(makeCopyOfGwsRaw);

useDB(convertBootstrapElementsRaw);
// useDB(convertStringsToNumbers);
