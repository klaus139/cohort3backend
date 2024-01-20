import express from 'express';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';

//import database
import connectDB from './config/database.js';

connectDB();


dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))


//routes
app.use('/api/users', userRoutes);




const PORT = process.env.PORT

app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`));

