require("dotenv").config();
const { useDB } = require("./connect");
const { getLatestDbGw } = require("./helpers");
const { getTopManagerStats } = require("./topManagerStats");

const valuesToAvg5 = [
  "creativity",
  "creativity_rank",
  "creativity_rank_type",
  "element_type",
  "ep_next",
  "ep_this",
  "event_points",
  "first_name",
  "form",
  "goals_conceded",
  "goals_scored",
  "ict_index",
  "ict_index_rank",
  "ict_index_rank_type",
  "id",
  "in_dreamteam",
  "influence",
  "influence_rank",
  "influence_rank_type",
  "minutes",
  "news",
  "news_added",
  "now_cost",
  "own_goals",
  "penalties_missed",
  "penalties_order",
  "penalties_saved",
  "penalties_text",
  "photo",
  "points_per_game",
  "red_cards",
  "saves",
  "second_name",
  "selected_by_percent",
  "special",
  "squad_number",
  "status",
  "team",
  "team_code",
  "threat",
  "threat_rank",
  "threat_rank_type",
  "total_points",
  "transfers_in",
  "transfers_in_event",
  "transfers_out",
  "transfers_out_event",
  "value_form",
  "value_season",
  "web_name",
  "yellow_cards",
  "gw_element",
  "gw_fixture",
  "gw_opponent_team",

  "gw_total_points",

  "gw_was_home",
  "gw_kickoff_time",
  "gw_team_h_score",
  "gw_team_a_score",
  "gw_round",

  "gw_minutes",

  "gw_goals_scored",

  "gw_assists",
  "gw_clean_sheets",
  "gw_goals_conceded",
  "gw_own_goals",
  "gw_penalties_saved",
  "gw_penalties_missed",
  "gw_yellow_cards",
  "gw_red_cards",
  "gw_saves",
  "gw_bonus",
  "gw_bps",
  "gw_influence",
  "gw_creativity",
  "gw_threat",
  "gw_ict_index",
  "gw_value",
  "gw_transfers_balance",
  "gw_selected",
  "gw_transfers_in",
  "gw_transfers_out",
  "points_pr_mill",
];

const addLatestElements = async (client) => {
  const arrOfLatestElements = [];
  const latestGw = await getLatestDbGw(client);
  const elements = await client
    .db("fpl")
    .collection("elements")
    .find({})
    .toArray();
  const topManagerStats = await getTopManagerStats(2, 314, latestGw);
  // console.log("salah", topManagerStats.topOwnGw[254]);
  elements.forEach((el) => {
    const newObj = {};
    for (const prop in el) {
      if (Array.isArray(el[prop])) {
        const val = el[prop][el[prop].length - 1].value;
        newObj[prop] =
          !isNaN(val) && typeof val == "string" && val !== ""
            ? parseFloat(val)
            : val;
      } else {
        newObj[prop] = el[prop];
      }
    }
    addPlayerTopManagerStats(newObj, topManagerStats);
    const latestIndex = el.total_points.findIndex((x) => x.gw == latestGw);
    const otherIndex = el.total_points.findIndex((x) => x.gw == latestGw - 5);
    try {
      newObj.last5ppg =
        (el.total_points[latestIndex].value -
          el.total_points[otherIndex].value) /
        5;
    } catch (e) {
      console.log("This guy wont get last5ppg; ", el.web_name);
    }
    try {
      newObj.last5ppgpm =
        ((el.total_points[latestIndex].value -
          el.total_points[otherIndex].value) /
          5 /
          el.now_cost.find((a) => a.gw == latestGw).value) *
        10;
    } catch (e) {
      console.log("This guy wont get last5ppgpm: ", el.web_name);
    }

    arrOfLatestElements.push(newObj);
  });

  await client
    .db("fpl")
    .collection("latestElements")
    .insertMany(arrOfLatestElements);
};
// useDB(addLatestElements);

const deleteLatestElements = async (client) => {
  await client.db("fpl").collection("latestElements").drop();
};

const setLatestElements = async (client) => {
  await deleteLatestElements(client);
  await addLatestElements(client);
};

useDB(setLatestElements);

const addPlayerTopManagerStats = (newObj, topManagerStats) => {
  if (Object.keys(topManagerStats.topOwnGw).includes(newObj.id.toString(10))) {
    newObj.ownPercent = parseFloat(
      topManagerStats.topOwnGw[newObj.id].ownPercent
    );
    newObj.capPercent = parseFloat(
      topManagerStats.topOwnGw[newObj.id].capPercent
    );
  } else {
    newObj.ownPercent = 0;
    newObj.capPercent = 0;
  }
  if (
    Object.keys(topManagerStats.topOwnGwMinus1).includes(newObj.id.toString(10))
  ) {
    newObj.ownPercentMinus1gw = parseFloat(
      topManagerStats.topOwnGwMinus1[newObj.id].ownPercent
    );
    newObj.capPercentMinus1gw = parseFloat(
      topManagerStats.topOwnGwMinus1[newObj.id].capPercent
    );
  } else {
    newObj.ownPercentMinus1gw = 0;
    newObj.capPercentMinus1gw = 0;
  }
  if (
    Object.keys(topManagerStats.topOwnGwMinus2).includes(newObj.id.toString(10))
  ) {
    newObj.ownPercentMinus2gw = parseFloat(
      topManagerStats.topOwnGwMinus2[newObj.id].ownPercent
    );
    newObj.capPercentMinus2gw = parseFloat(
      topManagerStats.topOwnGwMinus2[newObj.id].capPercent
    );
  } else {
    newObj.ownPercentMinus2gw = 0;
    newObj.capPercentMinus2gw = 0;
  }
  if (
    Object.keys(topManagerStats.topOwnGwMinus3).includes(newObj.id.toString(10))
  ) {
    newObj.ownPercentMinus3gw = parseFloat(
      topManagerStats.topOwnGwMinus3[newObj.id].ownPercent
    );
    newObj.capPercentMinus3gw = parseFloat(
      topManagerStats.topOwnGwMinus3[newObj.id].capPercent
    );
  } else {
    newObj.ownPercentMinus3gw = 0;
    newObj.capPercentMinus3gw = 0;
  }
  if (
    Object.keys(topManagerStats.topOwnGwMinus4).includes(newObj.id.toString(10))
  ) {
    newObj.ownPercentMinus4gw = parseFloat(
      topManagerStats.topOwnGwMinus4[newObj.id].ownPercent
    );
    newObj.capPercentMinus4gw = parseFloat(
      topManagerStats.topOwnGwMinus4[newObj.id].capPercent
    );
  } else {
    newObj.ownPercentMinus4gw = 0;
    newObj.capPercentMinus4gw = 0;
  }
};

module.exports = {
  setLatestElements,
};
