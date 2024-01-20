import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config()

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('succesfully connected to the database')

    }catch(error){
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB;