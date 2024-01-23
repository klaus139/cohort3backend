import express from 'express';
import { createUser, registerUser } from '../controller/userController.js';

const router = express.Router();

router.route('/').post(createUser)
router.route('/otp-registration').post(registerUser)

export default router;