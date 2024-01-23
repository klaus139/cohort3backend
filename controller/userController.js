import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import ErrorHandler from "../utils/ErrorHandler.js";
import { createActivationToken } from "../utils/token.js";
import sendMail from "../utils/sendMail.js";
import ejs from 'ejs';
import path from 'path';

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

export { createUser, registerUser };
