import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from 'bcryptjs'


const createUser = asyncHandler(async(req, res) => {
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            throw new Error('please fill in all the inputs')
        }

        //check if the user already exists in the database
        const userExists = await User.findOne({email});
        if(userExists) {
            res.status(400).json({
                message:'Email already exists, please login instead'
            })
        }
        

        //hash my password
        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = User({username, email, password:hashPassword})

        try{
            await newUser.save()

            res.status(201).json({
                success:true,
                _id:newUser._id,
                username:newUser.username,
                email:newUser.email,
                isAdmin:newUser.isAdmin
            })
        }catch(error){
            throw new Error('invalid user data')
        }


    }catch(error){
        console.log(`internal server error, ${error.message}`)
        throw new Error('error creating user')
    }
})

export {
    createUser
}