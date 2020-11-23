const fs = require('fs');
const root = require('app-root-path');
let playersDB = JSON.parse(fs.readFileSync(root + '/data/elements.json'));
let teamsDB = JSON.parse(fs.readFileSync(root + '/data/teams.json'));

const positionMap = [
  {
    code: 1,
    position: 'Goalkeeper',
  },
  {
    code: 2,
    position: 'Defence',
  },
  {
    code: 3,
    position: 'Midfielder',
  },
  {
    code: 4,
    position: 'Attacker',
  },
];

module.exports.positionMap = positionMap;
module.exports.playersDB = playersDB;
module.exports.teamsDB = teamsDB;
