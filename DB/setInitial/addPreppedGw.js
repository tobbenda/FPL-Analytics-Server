require("dotenv").config();
const { useDB } = require("./connect");

const { getLatestDbGw } = require("./helpers");

// useDB(addLatestElements);

const initDB = async (client) => {
  const gw = await getLatestDbGw(client);
  for (let i = 1; i <= gw; i++) {
    // await initWithCleanedBootstrapElements(client, i);
    // await addFieldsBasedOnInternalCalc(client, i);
    // i == 1 ? await createElementsCollection(client, i) : null;
    // await populateElementsData(client, i);
    // await addFieldsBasedOnInternalCalc(client, i);
  }
  // await addLatestElements(client);
};

useDB(initDB);

const deleteSomeFields = async (client, gw) => {
  await client
    .db()
    .collection("elements")
    .updateMany(
      {},
      { $unset: { points_pr_game_pr_mill: 1, points_pr_mill: 1 } },
      { multi: true }
    );
};

const makeCopyOfGwsRaw = async (client) => {
  const gw1 = await client.db("fpl").collection("gwsRaw").findOne({ gw: 1 });
  await client.db("fpl").collection("gwsRawCopy4").insertOne(gw1);
};

// useDB(makeCopyOfGwsRaw);

// const addFieldsBasedOnInternalCalc = async (client, gw) => {
//   await client
//     .db()
//     .collection("gws")
//     .updateOne({ gw: gw }, [
//       {
//         $set: {
//           elements: {
//             $map: {
//               input: "$elements",
//               in: {
//                 $mergeObjects: [
//                   "$$this",
//                   {
//                     points_pr_mill: {
//                       $divide: ["$$this.total_points", "$$this.now_cost"],
//                     },
//                     points_pr_game_pr_mill: {
//                       $divide: ["$$this.points_per_game", "$$this.now_cost"],
//                     },
//                   },
//                 ],
//               },
//             },
//           },
//         },
//       },
//     ]);
// };

// Not in use
// const addLastMatchStats = async (client, gw) => {
//   gw = 5;
//   if (gw == 1) {
//     // prevent adding
//   }
//   const { elements } = await client
//     .db()
//     .collection("gwsRaw")
//     .findOne({ gw: gw - 1 });
//   for (let i = 0; i < elements.length; i++) {
//     await client
//       .db()
//       .collection("gwsTest")
//       .updateOne(
//         { gw: gw, elements: { $elemMatch: { id: elements[i].id } } },
//         { $set: getNewStatsObj(elements[i]) }
//       );
//   }
// };

// Not in use
// const getNewStatsObj = (element) => {
//   const updateObject = {
//     "elements.$.points_pr_mill": getPointsPrMill(element),
//     "elements.$.points_pr_game_pr_mill": getPointsPrGamePrMill(element),
//     "elements.$.points_last_game": "not implemented",
//   };
//   return updateObject;
// };
// Not in use
// const getPointsPrMill = (element) => {
//   return element.total_points / element.now_cost;
// };
// Not in use
// const getPointsPrGamePrMill = (element) => {
//   return element.points_per_game / element.now_cost;
// };

// const createGwPlayers = (gwData) => {
//   const bootstrapElementsCleaned = chooseKeys(
//     gwData.gwBootstrapElements,
//     bootstrapElementKeysToKeep
//   );
//   const cleanedAndCorrectTypes = bootstrapElementsCleaned.map((el) => {
//     const newObj = {};
//     for (const prop in el) {
//       if (
//         !isNaN(el[prop]) &&
//         el[prop] != null &&
//         el[prop] != "true" &&
//         el[prop] != "false"
//       ) {
//         newObj[prop] = parseFloat(el[prop]);
//       } else {
//         newObj[prop] = el[prop];
//       }
//     }
//     return newObj;
//   });
//   return cleanedAndCorrectTypes;
// };

// const initWithCleanedBootstrapElements = async (client, gw) => {
//   console.log("initWithCleand: ", gw);
//   let gwData;
//   await client
//     .db()
//     .collection("gwsRaw")
//     .find({ gw: gw })
//     .forEach((el) => {
//       gwData = el;
//     });
//   const cleanedBootstrapElements = createGwPlayers(gwData);
//   await client
//     .db()
//     .collection("gws")
//     .insertOne({ gw: gw, elements: cleanedBootstrapElements });
// };
