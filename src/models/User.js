import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type :String, required: true, unique: true},
    avatarUrl: String,
    socialOnly: {type: Boolean, default: false},
    username: {type: String, unique: true},
    password: {type: String},
    name:{type: String},
    location : String,
    gender: String,
});

userSchema.pre("save", async function() {
    console.log("users pass word:", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    console.log("hashing password:", this.password);
})

const User = mongoose.model("User", userSchema);
export default User;