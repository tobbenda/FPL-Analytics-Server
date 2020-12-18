const request = require('request');

const getBootStrapData = async() => {
    const url = 'http://fantasy.premierleague.com/api/bootstrap-static/'
    return new Promise((resolve, reject)=> {
        request(url, {json:true}, (err, res, body)=> {
            if(err){
                console.log('Error fetching bootstrap static in getLastFinishedGW');
                reject(err)
            }
            if(!err && res.statusCode==200){
                resolve(body);
            }
        })
    })
}

const getLatestBootstrapGw = async() => {
    const bootstrapData = await getBootStrapData();
    const events = bootstrapData.events;
    for(let i=0; i< events.length; i++){
        if (events[i].finished==false){
            return(events[i].id-1)
        }
    }
}
const getBootstrapElementsAndTeams = async () => {
    const obj = {};
    const bootstrapData = await getBootStrapData();
    obj.bootstrapElements = bootstrapData.elements;
    obj.bootstrapTeams = bootstrapData.teams;
    return obj;
}

module.exports.getLatestBootstrapGw = getLatestBootstrapGw;
module.exports.getBootstrapElementsAndTeams = getBootstrapElementsAndTeams;