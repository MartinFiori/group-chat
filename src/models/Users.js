import mongoose from "mongoose";

const userCollection = 'users';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accountCreated: String,
    userColor: String,
    connection:Boolean,
})

const User = mongoose.model(userCollection, userSchema);
export default User;