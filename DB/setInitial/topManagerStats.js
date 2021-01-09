const request = require("request");
const fs = require("fs");
const root = require("app-root-path");

const getPageTeamIds = (page = 1, league = 314) => {
  const url = `https://fantasy.premierleague.com/api/leagues-classic/${league}/standings/?page_standings=${page}`;
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (error, res, body) => {
      if (error) {
        reject(error);
      }
      if (!error && res.statusCode == 200) {
        const idArr = body.standings.results.map((el) => el.entry);
        resolve(idArr);
      }
    });
  });
};

// getPageTeamIds();

const getManagerTeam = (managerId, gw) => {
  const url = `https://fantasy.premierleague.com/api/entry/${managerId}/event/${gw}/picks/`;
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (error, res, body) => {
      if (error) {
        reject(error);
      }
      if (!error && res.statusCode == 200) {
        resolve(body.picks);
      }
    });
  });
};

// getManagerTeam(627527, 8)
const makeTopManagersPlayerArray = async (pages = 2, league = 314, gw = 8) => {
  let playerArr = [];
  let teamIds = [];
  for (let i = 1; i <= pages; i++) {
    const thisPage = await getPageTeamIds(i, league);
    teamIds.push(...thisPage);
  }
  for (let j = 0; j < teamIds.length; j++) {
    const thisManagersPlayers = await getManagerTeam(teamIds[j], gw);
    playerArr.push(...thisManagersPlayers);
  }
  return playerArr;
};

const makeTopManagersPlayerArrayMultiple = async (
  pages = 2,
  league = 314,
  gw = 8
) => {
  console.log("Makeing top mangers player array multiple, gw:", gw);
  let playerArr = [];
  let minusOnePlayerArr = [];
  let minusTwoPlayerArr = [];
  let minusThreePlayerArr = [];
  let minusFourPlayerArr = [];
  const masterArr = [
    playerArr,
    minusOnePlayerArr,
    minusTwoPlayerArr,
    minusThreePlayerArr,
    minusFourPlayerArr,
  ];
  let teamIds = [];
  for (let i = 1; i <= pages; i++) {
    const thisPage = await getPageTeamIds(i, league);
    teamIds.push(...thisPage);
  }
  for (let j = 0; j < teamIds.length; j++) {
    // console.log("Getting for player: ", j);
    const thisManagersPlayers = await getManagerTeam(teamIds[j], gw);
    const minusOneManagersPlayers = await getManagerTeam(teamIds[j], gw - 1);
    const minusTwoManagersPlayers = await getManagerTeam(teamIds[j], gw - 2);
    const minusThreeManagersPlayers = await getManagerTeam(teamIds[j], gw - 3);
    const minusFourManagersPlayers = await getManagerTeam(teamIds[j], gw - 4);
    playerArr.push(...thisManagersPlayers);
    minusOnePlayerArr.push(...minusOneManagersPlayers);
    minusTwoPlayerArr.push(...minusTwoManagersPlayers);
    minusThreePlayerArr.push(...minusThreeManagersPlayers);
    minusFourPlayerArr.push(...minusFourManagersPlayers);
  }
  return masterArr;
};

// makeTopManagersPlayerArray(1, 314, 8);

const getArrayOfPlayerCounts = (arr) => {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    const player = arr[i];
    if (obj[player.element]) {
      obj[player.element].count += 1;
      if (player.is_captain) {
        obj[player.element].capCount += 1;
      }
    } else {
      const playerStatObj = {
        count: 1,
      };
      player.is_captain
        ? (playerStatObj.capCount = 1)
        : (playerStatObj.capCount = 0);
      obj[player.element] = playerStatObj;
    }
  }
  return obj;
};

const makeStats = async () => {
  const gw = 17;
  // const allPlayers = await makeTopManagersPlayerArray(2, 314, gw);
  // console.log("Starting to make arrs");
  const multipleAllPlayersArr = await makeTopManagersPlayerArrayMultiple(
    2,
    314,
    gw
  );
  // console.log("Have the arrs");

  const obj = getArrayOfPlayerCounts(multipleAllPlayersArr[0]);
  obj.gw = gw;
  // console.log("got obj");
  const obj1 = getArrayOfPlayerCounts(multipleAllPlayersArr[1]);
  obj1.gw = gw - 1;
  // console.log("got obj1");
  const obj2 = getArrayOfPlayerCounts(multipleAllPlayersArr[2]);
  obj2.gw = gw - 2;
  // console.log("got obj2");
  const obj3 = getArrayOfPlayerCounts(multipleAllPlayersArr[3]);
  obj3.gw = gw - 3;
  // console.log("got obj3");
  const obj4 = getArrayOfPlayerCounts(multipleAllPlayersArr[4]);
  obj4.gw = gw - 4;
  // console.log("got obj4");

  // console.log("Starting to add percent");
  addPercent(obj, multipleAllPlayersArr[0].length);
  addPercent(obj1, multipleAllPlayersArr[1].length);
  addPercent(obj2, multipleAllPlayersArr[2].length);
  addPercent(obj3, multipleAllPlayersArr[3].length);
  addPercent(obj4, multipleAllPlayersArr[4].length);
  // console.log("Added percents");

  const objArr = [obj, obj1, obj2, obj3, obj4];
  // console.log(objArr);
  return objArr;
};

const addPercent = (obj, numberOfPlayers) => {
  // console.log(
  //   "adding percent for:",
  //   obj.gw,
  //   "with: ",
  //   numberOfPlayers,
  //   "players"
  // );
  for (const [key, value] of Object.entries(obj)) {
    if (key == "gw") {
      return;
    }
    obj[key].ownPercent = parseFloat(
      ((obj[key].count / (numberOfPlayers / 15)) * 100).toFixed(1)
    );
    obj[key].capPercent = parseFloat(
      ((obj[key].capCount / (numberOfPlayers / 15)) * 100).toFixed(1)
    );
  }
};

const getTopManagerStats = async (pages = 2, league = 314, gw = 8) => {
  const a = await makeStats();
  const masterObj = {};
  masterObj.topOwnGw = a[0];
  masterObj.topOwnGwMinus1 = a[1];
  masterObj.topOwnGwMinus2 = a[2];
  masterObj.topOwnGwMinus3 = a[3];
  masterObj.topOwnGwMinus4 = a[4];
  // console.log(a);
  return masterObj;
};

// getTopManagerStats();
module.exports.getTopManagerStats = getTopManagerStats;
