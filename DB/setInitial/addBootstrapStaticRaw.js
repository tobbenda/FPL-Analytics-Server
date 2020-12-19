const {MongoClient} = require('mongodb')
require('dotenv').config();
const fs = require('fs');

const addBootstrapStaticRaw = async (gw, bootstrapElements, bootstrapTeams) => {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmqfa.mongodb.net/fpl?retryWrites=true&w=majority`
    console.log({uri});
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log('connected..');
        await client.db('fpl').collection('gwsRaw').updateOne({gw:gw}, {$set:{gwBootstrapElements:bootstrapElements, gwBootstrapTeams:bootstrapTeams}})
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

const bootstrapElements = JSON.parse(fs.readFileSync('/Users/torbjorndahl/Downloads/csvjson.json'))
const bootstrapTeams = JSON.parse(fs.readFileSync('/Users/torbjorndahl/Downloads/t.json'))
const gw = 13;
addBootstrapStaticRaw(gw, bootstrapElements, bootstrapTeams)