// designer-shop-backend/models/UserModel.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product' 
            }
        ]
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return enteredPassword === this.password;
};


const User = mongoose.models.User || mongoose.model('User', userSchema); 
// თუ მოდელი უკვე არსებობს (mongoose.models.User), გამოიყენე ის. თუ არა, შექმენი.

export default User;