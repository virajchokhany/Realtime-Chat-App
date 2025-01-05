const mongoose = require('mongoose');

const connectDb = async function(){
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected : ${conn.connection.host}`.green);
    }catch(error){
        console.log(`${error.message}`.red.bold);
        process.exit();
    }
}

module.exports = connectDb;