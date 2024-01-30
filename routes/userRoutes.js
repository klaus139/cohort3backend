import express from 'express';
import { activateUser, createUser, registerUser, simpleLogin } from '../controller/userController.js';

const router = express.Router();

router.route('/').post(createUser)
router.route('/otp-registration').post(registerUser)
router.post('/activate-user', activateUser);
router.post('/login-user', simpleLogin )

export default router;