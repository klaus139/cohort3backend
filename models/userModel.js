import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true,

    },
    isAdmin:{
        type: Boolean,
        required: true,
        default: false,
    },
   isVerfied:{

   },
   isBlocked:{

   },
   
   
},{
    timestamps: true
});

userSchema.methods.comparePassword = async function (
    enteredPassword
){
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema);

export default User;