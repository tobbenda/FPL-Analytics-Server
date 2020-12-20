const {MongoClient} = require('mongodb');

const connect = () => {
    try{
        const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmqfa.mongodb.net/fpl?retryWrites=true&w=majority`
        return MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((client) => {
            console.log('Connected..');
            return client;
        })
    }catch(e){
        console.log('Something went wrong with connection:');
        console.log(e);
    }
}

const useDB = async(cb)=>{
    const client = await connect()
    try{
        await cb(client);
    }catch(e){
        console.log('Something went wrong:');
        console.error(e)
    }finally{
        client.close()
        .then(console.log('Connection closed.'))
    }
}

module.exports.connect = connect;
module.exports.useDB = useDB;