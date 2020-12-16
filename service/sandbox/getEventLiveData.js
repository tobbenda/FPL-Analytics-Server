const request = require('request');
const fs = require('fs');
const root = require('app-root-path');
let options = { json: true };


const fileName = (gw) => {
//   const date = new Date();
//   const day = date.getUTCDate();
//   const month = date.getMonth();
//   const hour = date.getUTCHours();
//   const min = date.getUTCMinutes();
//   const sec = date.getUTCSeconds();

  return `${root}/service/sandbox/eventLiveData/event_live_gw_${gw}.json`;
};

async function getData2(i) {
const url = `https://fantasy.premierleague.com/api/event/${i}/live/`;
  await request(url, options, (error, res, body) => {
    if (error) {
      return console.log(error);
    }
    if (!error && res.statusCode == 200) {
      fs.writeFileSync(fileName(i), JSON.stringify(body.elements));
    //   fs.writeFileSync(
    //     root + '/data/elements.json',
    //     JSON.stringify(body.elements)
    //   );
    }
  });
  console.log('done with', i);
}


async function motherFunction() {
    for (let i = 1; i < 13; i++){
        getData2(i)
    }
}
motherFunction();

