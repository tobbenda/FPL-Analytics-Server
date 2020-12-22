const express = require("express");
const bodyParser = require("body-parser");
const cors = require(`cors`);
const request = require("request");
const PORT = process.env.PORT || 4001;
const elements = require("./routes/elements");
const teams = require("./routes/teams");

// const router = express.Router();
// router.get("/", (req, res, next) => {
//   console.log("yolo");
// });

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/elements", elements); //elementRouter not implemented
app.use("/teams", teams);
// app.post('/myteam', (req, res) => {
//   const { email, password, playerID } = req.body;
//   login(req, res, email, password, playerID);
//   // res.end('gret success');
// });

app.listen(PORT);
// console.log('Running a GraphQL API server at http://localhost:4001/graphql');

// const login = async (req, resp, email, password, playerID) => {
//   try {
//     const formData = {
//       password: password,
//       login: email,
//       redirect_uri: 'https://fantasy.premierleague.com/a/login',
//       app: 'plfpl-web',
//     };
//     const cookiePattern = new RegExp(/(?<=pl_profile=)[^;]+/);
//     request.post(
//       {
//         url: 'https://users.premierleague.com/accounts/login/',
//         formData: formData,
//       },
//       async function optionalCallback(err, httpResponse, body) {
//         if (err) {
//           return console.error('upload failed:', err);
//         }
//         console.log('RESPONSE URL: ', httpResponse.caseless.dict.location);
//         let rawUrl = httpResponse.caseless.dict.location;
//         let parsedUrl = URL.parse(rawUrl);
//         let parsedQs = qs.parse(parsedUrl.query);
//         console.log('STATE: ', parsedQs.state);
//         if (parsedQs.state === 'success') {
//           const myCookieString = `pl_profile=${
//             httpResponse.caseless.dict['set-cookie'][0].match(cookiePattern)[0]
//           }`;
//           const j = request.jar();
//           const url = `https://fantasy.premierleague.com/api/my-team/${playerID}/`;
//           j.setCookie(myCookieString, url);
//           await request({ url: url, jar: j }, (err, res, bod) => {
//             if (err) {
//               console.log('ERROR:', err);
//             } else {
//               resp.json(JSON.parse(bod));
//             }
//           });
//         } else {
//           resp.status(400);
//           resp.end();
//         }
//       }
//     );
//   } catch (e) {
//     console.log('error');
//   }
// };
