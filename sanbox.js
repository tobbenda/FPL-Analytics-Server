const axios = require('axios');
const fs = require('fs');
const request = require('request');
const fetch = require('node-fetch');


let options = {json: true};
const url = 'https://fantasy.premierleague.com/api/leagues-classic/314/standings/'


const tryWithAxios = () => {
  axios.get('https://fantasy.premierleague.com/api/leagues-classic/314/standings/')
  .then(response => console.log(response)); // Wierd response object. content-length: 0. data: ''
}


let arr = [] 
function getData(){
  // let arr = []
  try{
    const data = request(url, options, (error, res, body) => {
      if (error) {
          return  console.log(error)
      };
      if (!error && res.statusCode == 200) {
        const idArr = body.standings.results.map((el) => el.entry);
        console.log(idArr); //PRINTS WHAT I WANT
        arr.push(idArr)
        return(idArr)
      };
    });
    console.log(typeof data);  
  } catch(e){
    console.log(e);
  } finally {
    return arr
  }
}
// getData()
// setTimeout(() => {    // How can I wait for it in a more gracefull manner, if it doesnt use promises?
//   console.log(arr);
// }, 2000);

// Since I couldn manage to gete the data from the axios or fetch return object, I tried this withh requests. The problem
// with that occurs when I want to add all the inner fetches resuls to an array.
const doEverything = () => {
  let arr = []
    request(url, options, (error, res, body) => {
      if (error) {
          return  console.log(error)
      };
      if (!error && res.statusCode == 200) {
        const idArr = body.standings.results.map((el) => el.entry);
        console.log(idArr); //PRINTS WHAT I WANT

        console.log(idArr.length);
        for( let i = 0; i < idArr.length; i++ ){
          request(`https://fantasy.premierleague.com/api/entry/${idArr[i]}/event/8/picks/`, options, (error, res, body) => {
          if (error) {
              return  console.log(error)
          };
          if (!error && res.statusCode == 200) {
              fs.appendFileSync('./service/bestPicks.json', JSON.stringify(body)); // HHacy Hacky
              console.log(body);
          };
        });
        }
        console.log(arr);
      };
    });
}
// doEverything();



const doEverything2 = () => {
  let arr = []
    request(url, options, (error, res, body) => {
      if (error) {
          console.log(error);
      };
      if (!error && res.statusCode == 200) {
        const idArr = body.standings.results.map((el) => el.entry);
        for( let i = 0; i < idArr.length; i++ ){
          request(`https://fantasy.premierleague.com/api/entry/${idArr[i]}/event/8/picks/`, options, (error, res, body) => {
          if (error) {
              return  console.log(error)
          };
          if (!error && res.statusCode == 200) {
              arr.push(body)
          };
        });
        }
      };
    });
    setTimeout(() => {
      console.log(arr);
    }, 2000);
}
doEverything2();





// TRY WITH HTTP
const tryWithHTTP = () => {
  const https = require('https');

  https.get(url, (resp) => {
    let data = '';
  
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data).standings);
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
// tryWithHTTP();


//Try with fetch from TWILIO 

const fetchFromTwilio = async () => {
  try {

    const response = await fetch('url') // However works with https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY
    console.log(typeof response); // object 
    const json = await response.json()    //INVALID JSON

    console.log(json);
    // console.log(json.explanation);
  } catch (error) {
    console.log(error);
  }
};
// fetchFromTwilio(); 



// // const url2 = 'https://fantasy.premierleague.com/api/entry/625796/event/8/picks/'
// async function getPlayerTeam(nr){
//   await request(`https://fantasy.premierleague.com/api/entry/${nr}/event/8/picks/`, options, (error, res, body) => {
//     if (error) {
//         return  console.log(error)
//     };
//     if (!error && res.statusCode == 200) {
//       console.log(body);
//       return body;
//         // console.log(body);
//     };
//   });
// }




// function getData2(){
//    const a = request('https://swapi.dev/api/planets/3', options, async (error, res, body) => {
//      console.log(a);
//     return body;
//    });
// }
// getData2()


// async function motherFunction(){
//   try {
//       const arr = await getData();
//       console.log({arr});
//   } catch(e) {
//     console.log(e);
//   }
//   // await getPlayerTeam(2935529);
//   // await getPlayerTeam(3036490);
//   // await getPlayerTeam(4732706);
// }

// // motherFunction()

// // const url2 = 'https://fantasy.premierleague.com/api/entry/625796/event/8/picks/'
// async function getPlayerTeam(nr){
//   await request(`https://fantasy.premierleague.com/api/entry/${nr}/event/8/picks/`, options, (error, res, body) => {
//     if (error) {
//         return  console.log(error)
//     };
//     if (!error && res.statusCode == 200) {
//       console.log(body);
//       return body;
//         // console.log(body);
//     };
//   });
// }


// getPlayerTeam()















// const request = require('request');

// const formData = {
//   password,
//   login: 'tobbenda@gmail.com',
//   redirect_uri: 'https://fantasy.premierleague.com/a/login',
//   app: 'plfpl-web'
// }

// const login = async() => {
//   const cookiePattern = new RegExp(/(?<=pl_profile=)[^;]+/);
//   request.post({url:'https://users.premierleague.com/accounts/login/', formData: formData}, async function optionalCallback(err, httpResponse, body) {
//     if (err) {
//       return console.error('upload failed:', err);
//     }
//     const myCookieString = `pl_profile=${httpResponse.caseless.dict['set-cookie'][0].match(cookiePattern)[0]}`;
//     const j = request.jar();
//     const cookie = myCookieString;
//     const url = 'https://fantasy.premierleague.com/api/my-team/627527/';
//     j.setCookie(cookie, url);
//     await request({url: url, jar: j}, (err, res, bod) => {
//       if (err) {
//         console.log(err);
//       }else {
//         const test = JSON.parse(bod);
//         console.log(test);
//       }
//     });
//     console.log('Upload successful!  Server responded with:', httpResponse.caseless.dict['set-cookie'][0]);
//   }); 
// }
// login()


// const password = 'pepe1445';
// // const formData = {
// //   password,
// //   login: 'tobbenda@gmail.com',
// //   redirect_uri: 'https://fantasy.premierleague.com/a/login',
// //   app: 'plfpl-web'
// // }
// //   const login = async() => {
// //     const cookiePattern = new RegExp(/(?<=pl_profile=)[^;]+/);
// //     request.post({url:'https://users.premierleague.com/accounts/login/', formData: formData}, async function optionalCallback(err, httpResponse, body) {
// //       if (err) {
// //         return console.error('upload failed:', err);
// //       }
// //       // const myCookieString = `pl_profile=${httpResponse.caseless.dict['set-cookie'][0].match(cookiePattern)[0]}`;
// //       // const j = request.jar();
// //       // const cookie = myCookieString;
// //       const url = 'https://fantasy.premierleague.com/api/my-team/627527/';
// //       // j.setCookie(cookie, url);
// //       await request({url: url}, (err, res, bod) => {
// //         if (err) {
// //           console.log(err);
// //         }else {
// //           const test = JSON.parse(bod);
// //           console.log(test);
// //         }
// //       });
// //     }); 
// //   }
// //   login();

// var myHeaders = new Headers();
// myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

// var urlencoded = new URLSearchParams();
// urlencoded.append("password", "pepe1445");
// urlencoded.append("login", "tobbenda@gmail.com");
// urlencoded.append("redirect_uri", "https://fantasy.premierleague.com/a/login");
// urlencoded.append("app", "plfpl-web");

// var requestOptions = {
//   method: 'POST',
//   headers: myHeaders,
//   body: urlencoded,
//   redirect: 'follow'
// };

// fetch("https://users.premierleague.com/accounts/login/", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));