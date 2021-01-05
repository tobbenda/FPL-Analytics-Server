require("dotenv").config();
const { useDB } = require("./connect");
const { getLatestDbGw } = require("./helpers");

const addLatestElements = async (client) => {
  const arrOfLatestElements = [];
  const latestGw = await getLatestDbGw(client);
  const elements = await client
    .db("fpl")
    .collection("elements")
    .find({})
    .toArray();
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
  // await deleteLatestElements(client);
  await addLatestElements(client);
};

useDB(setLatestElements);

module.exports = {
  setLatestElements,
};

// const createElementLatest = (el, gw) => {
//   const obj = {};
//   for (const prop in el) {
//     if (Array.isArray(el[prop])) {
//       const { value } = el[prop].find((gwEl) => gwEl.gw === gw);
//       obj[prop] =
//         typeof value == "string" && !isNaN(value) && value != ""
//           ? parseFloat(value)
//           : value;
//     } else {
//       obj[prop] = el[prop];
//     }
//   }
//   return obj;
// };

// const addLatestElements = async (client) => {
//   const lastGw = await getLatestDbGw(client);
//   await client
//     .db("fpl")
//     .collection("elements")
//     .find({})
//     .forEach(async (el) => {
//       const element = createElementLatest(el, lastGw);
//       await client.db("fpl").collection("latestElements").insertOne(element);
//     });
// };

// useDB(addLatestElements);
