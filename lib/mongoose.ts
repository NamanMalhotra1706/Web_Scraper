import mongoose from "mongoose";

let isConnected = false;

export default async function connectToDB(){

    mongoose.set('strictQuery',true); // Strict Mode Activate

    if(!process.env.MONGODB_URI){
       return console.log("MongoDB URI not Defined: ");
    }

    if(isConnected){
        return console.log('Using Existing Database Connection');
    }

    try{
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected=true;

        console.log('MongoDb Connection made Successfully');

    }

    catch(error){
        console.log('Error while making Connection : ',error);
    }
}
