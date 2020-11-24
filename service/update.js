const root = require('app-root-path');
const remote = require(root + '/service/helpers/getData');
const preppers = require(root + '/service/helpers/preppingFunctions');
const { updateTopPlayerData } = require(root +
  '/service/helpers/makeTopManagerStats');

async function update() {
  await remote.getData();
  const pages = 4;
  const league = 314;
  const gw = 9;
  await updateTopPlayerData(pages, league, gw);
  await preppers.prepPlayers();
}

update();
