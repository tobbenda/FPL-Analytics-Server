const {MongoClient} = require('mongodb')
const helpers = require('./helpers');
const request = require('request')
require('dotenv').config();

var schedule = require('node-schedule');
var j = schedule.scheduleJob('*/30 * * * *', function(){
  console.log('Holla');
});

const getGwLiveElements = (gw) => {
    const url = `https://fantasy.premierleague.com/api/event/${gw}/live/`;
    return new Promise((resolve, reject) => {
        request(url, {json:true}, (error,res,body)=> {
            if (error){
                reject(error)
            }
            if(!error && res.statusCode == 200){
                const elements = body.elements;
                resolve(elements);
            }
        })
    })
}

const getOneElementGWSummary = (playerID, gw) => {
    const url = `https://fantasy.premierleague.com/api/element-summary/${playerID}/`
    return new Promise((resolve, reject) => {
        request(url, {json:true},(error,res,body)=> {
            if (error){
                reject(error)
            }
            if(!error && res.statusCode==200){
                const specificGW = body.history.find((el) => el.round == gw)
                resolve(specificGW)
            }
        })
    })
}


const getGwElementSummaries= async (gw, ids) => {
    const gwPlayerSummaries = []
    for (let i=0; i<ids.length;i++){
        const playerSummary = await getOneElementGWSummary(ids[i], gw)
        gwPlayerSummaries.push(playerSummary)
    }
    return gwPlayerSummaries;
}

const getTimeStamp = () => {
    const date = new Date();
    const day = date.getUTCDate();
    const month = date.getMonth();
    const hour = date.getUTCHours();
    const min = date.getUTCMinutes();
    const stringDate = `${day}/${month+1}/${hour}:${min}`;
    return stringDate;
}

const getNewDataAndUpdate = async(latestBootstrapGw, client) => {
    const gwLiveElements = await getGwLiveElements(latestBootstrapGw);
    const gwElementSummaries = await getGwElementSummaries(latestBootstrapGw, gwLiveElements.map(el=> el.id));
    const {bootstrapElements, bootstrapTeams} = await helpers.getBootstrapElementsAndTeams();
    await client.db('fpl').collection('gwsRaw').insertOne({gw:latestBootstrapGw, event_live_elements: gwLiveElements, element_summaries:gwElementSummaries, gwBootstrapTeams:bootstrapTeams, gwBootstrapElements:bootstrapElements})
    const time = getTimeStamp()
    await client.db('fpl').collection('details').updateOne({name:"details"}, {$set:{latestGW:latestBootstrapGw}, $push:{updateTimes:{gw:latestBootstrapGw, time:time}}})
    console.log('bootstrapelements, bootstrapteams, liveElements, elementSummaries created and details updated for gw:', latestBootstrapGw);
}
// const testENV=()=> {
//     console.log(process.env);
// }
// testENV();
const updateDB = async () => {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmqfa.mongodb.net/fpl?retryWrites=true&w=majority`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const latestDbGw = await getLatestDbGw(client);
        const latestBootstrapGw = await helpers.getLatestBootstrapGw();
        if (latestBootstrapGw>latestDbGw){
            console.log('New Gameweek to update!');
            await getNewDataAndUpdate(latestBootstrapGw, client);
        } else {
            console.log('Not a new gameweek finished yet');
            const time = getTimeStamp();
            await client.db('fpl').collection('details').updateOne({name: 'details'},{$push:{updateChecks:{time: time}}})
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
// updateDB()

const getLatestDbGw = async(client) => {
    const details = await client.db('fpl').collection('details').findOne({name:"details"})
    return details.latestGW;
}


const testStuff = async (cb) => {
    const uri = "mongodb+srv://tobbenda:peae1445@cluster0.nmqfa.mongodb.net/fpl?retryWrites=true&w=majority"
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        await cb(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
// updateDB().catch(console.error);
module.exports.updateDB = updateDB;


// export { updateDB as default };