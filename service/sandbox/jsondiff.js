const request = require('request');
const fs = require('fs');
const root = require('app-root-path');
const jsonDiff = require('json-diff');

// const x = JSON.parse(fs.readFileSync(`${root}/service/sandbox/data/players_9_11_1956_41.json`));
const bam1 = JSON.parse(fs.readFileSync(`${root}/service/sandbox/data/players_10_11_051_50.json`))[283];
const x = JSON.parse(fs.readFileSync(`${root}/data/history/teams_5_10_1619.json`));

// const bamford1 = x.find((el, i) => {
//     if (el.id === 202){
//         console.log(i);
//         return true;
//     }
// })
// const y = JSON.parse(fs.readFileSync(`${root}/service/sandbox/data/players_10_11_1651_51.json`));
const bam2 = JSON.parse(fs.readFileSync(`${root}/service/sandbox/data/players_10_11_151_50.json`))[283];
const y = JSON.parse(fs.readFileSync(`${root}/data/history/teams_9_11_189.json`));


// const bamford2 = x.find((el, i) => {
//     if (el.id === 202){
//         console.log(i);
//         return true;
//     }
// })

// console.log(bam1);
// console.log(bam2);
console.log(jsonDiff.diff(x, y))