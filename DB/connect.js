


// const mongoose = require('mongoose');

//Should use pool? 

// const connect = (password, dbName) => {
//   const dbUrl = `mongodb+srv://Einar:${password}@cluster0.8zyic.mongodb.net/${dbName}?retryWrites=true&w=majority`;
//   mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true,
//   });

//   const db = mongoose.connection;
//   db.on('error', console.error.bind(console, 'connection error:'));
//   db.once('open', function () {
//     console.log('connected!');
//   });
// };

// module.exports = connect;