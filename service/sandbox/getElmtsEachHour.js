const request = require('request');
const fs = require('fs');
const root = require('app-root-path');

let options = { json: true };
const url = 'http://fantasy.premierleague.com/api/bootstrap-static/';

const fileName = (cat) => {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getMonth();
  const hour = date.getUTCHours();
  const min = date.getUTCMinutes();
  const sec = date.getUTCSeconds();

  return `${root}/service/sandbox/data/${cat}_${day}_${month}_${hour}${min}_${sec}.json`;
};

async function getData2() {
  await request(url, options, (error, res, body) => {
    if (error) {
      return console.log(error);
    }
    if (!error && res.statusCode == 200) {
      fs.writeFileSync(fileName('players'), JSON.stringify(body.elements));
      fs.writeFileSync(
        root + '/data/elements.json',
        JSON.stringify(body.elements)
      );
      fs.writeFileSync(fileName('teams'), JSON.stringify(body.teams));
      fs.writeFileSync(root + '/data/teams.json', JSON.stringify(body.teams));
    }
  });
}


async function motherFunction() {
    setInterval(getData2, 1000 * 60 * 60 )
//   const data = await getData();
}
motherFunction();

