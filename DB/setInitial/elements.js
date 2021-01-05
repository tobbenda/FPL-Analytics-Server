require("dotenv").config();
const { useDB } = require("./connect");

const createElement = (el, elementSummaryKeys) => {
  const newObj = {};
  for (const prop in el) {
    if (staticValues.includes(prop)) {
      newObj[prop] = el[prop];
    } else {
      newObj[prop] = [];
    }
  }
  elementSummaryKeys.forEach((key) => (newObj["gw_" + key] = []));
  return newObj;
};

const staticValues = [
  // used in createElement and initElements for now
  "code",
  "elements_type",
  "first_name",
  "id",
  "second_name",
  "team",
  "team_code",
  "web_name",
];

const createEmptyOwnStatArrays = (elements) => {
  elements.forEach((el) => {
    el.points_pr_mill = [];
    el.points_pr_game_pr_mill = [];
  });
};

const addToOwnStat = (element, el) => {
  element.points_pr_mill.push((el.total_points * 10) / el.now_cost);
  element.points_pr_game_pr_mill.push((el.points_per_game * 10) / el.now_cost);
};

const addGwBootstrapDataForElement = (
  el,
  staticValues,
  elements,
  playerIndex,
  gw
) => {
  for (const prop in el) {
    if (!staticValues.includes(prop)) {
      try {
        elements[playerIndex][prop].push({ gw: gw, value: el[prop] });
      } catch (e) {
        console.log(e);
      }
    }
  }
};

const initElements = async (client) => {
  const data = await client.db("fpl").collection("gwsRaw").find({}).toArray();
  const elementIds = data[0].gwBootstrapElements.map((el) => el.id);
  const elements = [];
  const elementSummaryKeys = Object.keys(data[0].element_summaries[0]);
  data[0].gwBootstrapElements.forEach((el) => {
    const newEl = createElement(el, elementSummaryKeys);
    elements.push(newEl);
  });
  createEmptyOwnStatArrays(elements);
  data.forEach((gw) => {
    console.log("Getting data for gw: ", gw.gw);
    gw.gwBootstrapElements.forEach((el) => {
      if (!elementIds.includes(el.id)) {
        const newEl = createElement(el, elementSummaryKeys);
        createEmptyOwnStatArrays([newEl]);
        elements.push(newEl);
        elementIds.push(newEl.id);
      }
      const playerIndex = elements.findIndex((x) => x.id == el.id);
      addGwBootstrapDataForElement(
        el,
        staticValues,
        elements,
        playerIndex,
        gw.gw
      );

      addToOwnStat(elements[playerIndex], el);
    });
    gw.element_summaries.forEach((el) => {
      if (el) {
        for (const prop in el) {
          try {
            elements
              .find((element) => element.id == el.element)
              ["gw_" + prop].push({ gw: gw.gw, value: el[prop] });
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  });
  await client.db("fpl").collection("newElements").insertMany(elements);
};

useDB(initElements);
