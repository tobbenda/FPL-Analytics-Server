const request = require('request');
const fs = require('fs');

const getGWLiveElements = (gw) => {
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

const getOnePlayerGWSummary = (playerID, gw) => {
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


const getGWplayerSummaries= async (gw, ids) => {
    const gwPlayerSummaries = []
    for (let i=0; i<ids.length;i++){
        const playerSummary = await getOnePlayerGWSummary(ids[i], gw)
        gwPlayerSummaries.push(playerSummary)
    }
    return gwPlayerSummaries;
}

const getGwObject=(gw, event_live_elements, element_summaries) => {
    return {
        gw,
        event_live_elements,
        element_summaries
    }
}

const motherFunction = async(pastFinishedGW) =>{
    const gwArr = [];
    for (let i=1; i<=pastFinishedGW; i++){
        const gw = i;
        const gwLiveElements = await getGWLiveElements(gw);
        const ids = gwLiveElements.map(el=> el.id)
        const gwPlayerSummaries = await getGWplayerSummaries(gw, ids);
        const gwObject = getGwObject(gw, gwLiveElements, gwPlayerSummaries)
        gwArr.push(gwObject);
    }
    console.log(gwArr);
    fs.writeFileSync(`./gwArray.json`, JSON.stringify(gwArr))
}

const pastFinishedGW = 12;
motherFunction(pastFinishedGW);
