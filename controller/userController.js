import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import ErrorHandler from "../utils/ErrorHandler.js";
import { createActivationToken } from "../utils/token.js";
import sendMail from "../utils/sendMail.js";
import ejs from 'ejs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { sendToken } from "../utils/jwt.js";
import createToken from "../utils/creatToken.js";

const createUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new Error("please fill in all the inputs");
    }

    //check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        message: "Email already exists, please login instead",
      });
    }

    //hash my password
    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = User({ username, email, password: hashPassword });

    try {
      await newUser.save();

      res.status(201).json({
        success: true,
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      });
    } catch (error) {
      throw new Error("invalid user data");
    }
  } catch (error) {
    console.log(`internal server error, ${error.message}`);
    throw new Error("error creating user");
  }
});

//otp registration

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new Error("please fill in all the inputs");
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const user = {
      username,
      email,
      password,
    };
    

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const data = { user: { username: user.username }, activationCode };


    // const html = await ejs.renderFile(
    //   path.join(__dirname, "../mails/activation-mail.ejs"),
    //   data
    // );

    //send message to user email

    try {
      await sendMail({
        email: user.email,
        subject: "Account activation",
        template: "activation-mail.ejs",
        data,
        
      });

      res.status(200).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account`,
        activationCode: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
  }
});

//activating the user
const activateUser = asyncHandler(async(req, res, next) => {
  try{
    const {activation_token, activation_code} = req.body;

    const newUser = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET
    )

    if(newUser.activationCode !== activation_code) {
      return next(new ErrorHandler('invalid activation code', 400))
    }

    const {username, email, password} = newUser.user;
    const existUser = await User.findOne({email})

    if(existUser){
      return next(new ErrorHandler("email already exists", 400))
    }

    const user = await User.create({
      username,email, password
    });

    res.status(201).json({
      success:true,
      user
    })

    

  }catch(error){
    console.log(error)
    return next(new ErrorHandler(error.message, 400));
  }
})

//login user
// const loginUser = asyncHandler(async(req, res, next)=> {
//   try{
//     const {email, password} = req.body;
//     if(!email || !password){
//       return next(new ErrorHandler('Please enter enter and password', 400))
//     }

//     const user = await User.findOne({email})
//     if(!user){
//       return next(new ErrorHandler('Invalid email or password'));
//     }

//     // const isPasswordMatch = await user.comparePassword(password);
//     // if(!isPasswordMatch){
//     //   return next(new ErrorHandler('password does not match', 400));

//     // }
//     sendToken(user, 200, res)



//   }catch(error){
//     console.log(error)
//     return next(new ErrorHandler(error.message, 400));

//   }
// })


//simple login function
const simpleLogin = asyncHandler(async(req, res, next) => {
  try{
    const {email, password} = req.body;

    if(!email || !password){
      return next(new ErrorHandler('please fill in the email and password', 400))
    }

    const existingUser = await User.findOne({email});

    if(!existingUser){
      return next(new ErrorHandler('You are not a user, please register', 400));
    }
    if (existingUser) {
      const isPasswordValid = bcrypt.compare(password, existingUser.password);
      if(!isPasswordValid){
        throw new Error('password is not correct');
      }
      if(isPasswordValid){
        createToken(res, existingUser._id);

        res.status(201).json({
          message: 'successfullu logged in',
          existingUser
        })
        
      }

    }
    
  }catch(error){
    console.log(error)
    throw new Error(`error loggin in`)
  }
})

export { createUser, registerUser, activateUser, simpleLogin };
