const request = require('request');
const fs = require('fs');
const root = require('app-root-path');

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
  fs.writeFileSync(
    root + '/data/top_managers_player_array.json',
    JSON.stringify(playerArr)
  );
  fs.writeFileSync(
    fileName('top_manager_player_array'),
    JSON.stringify(playerArr)
  );
  return playerArr;
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

const fileName = (dataCategory) => {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getMonth();
  const hour = date.getUTCHours();
  const min = date.getUTCMinutes();

  return `${root}/data/history/${dataCategory}_${day}_${month}_${hour}${min}.json`;
};

const makeStats = () => {
  const allPlayers = JSON.parse(
    fs.readFileSync(root + '/data/top_managers_player_array.json')
  );
  const numberOfPlayers = allPlayers.length;
  const obj = getArrayOfPlayerCounts(allPlayers);
  for (const [key, value] of Object.entries(obj)) {
    obj[key].ownPercent = (
      (obj[key].count / (numberOfPlayers / 15)) *
      100
    ).toFixed(1);
    obj[key].capPercent = (
      (obj[key].capCount / (numberOfPlayers / 15)) *
      100
    ).toFixed(1);
  }
  fs.writeFileSync(root + '/data/top_manager_stats.json', JSON.stringify(obj));
  fs.writeFileSync(fileName('top_manager_stats'), JSON.stringify(obj));
};

const motherFunction = async (pages = 2, league = 314, gw = 8) => {
  await makeTopManagersPlayerArray(pages, league, gw);
  makeStats();
};

module.exports.updateTopPlayerData = motherFunction;
