import express from 'express';
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import utils from "../lib/utils.js";
import cloudinary from '../lib/cloudinary.js';

const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credential"})
        }
        await bcrypt.compare(password, user.password, (err, result) => {
            if(result){
                utils.generateToken(user._id, res);
                res.status(200).json({
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    profilePic: user.profilePic
                });
            }else{
                return res.status(400).json({message: "Invalid Credential"})
            }
        });
    }catch(error){
        console.log("Error in login controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
const logout = (req, res) => {
    try{
        res.clearCookie("token");
        res.status(200).json({message: "Logged out successfully"});
    }catch(error){
        console.log("Error in logout controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
const signup = async (req, res) => {
    const { fullname, email, password, profilePic } = req.body;
    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        //create a salt
        const salt = await bcrypt.genSalt(10);
        //create hash fro password
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashPassword,
            profilePic
        });
        if (newUser) {
            //generate token
            utils.generateToken(newUser._id, res);
            await newUser.save(); //save user

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic
            });
        } else {
            res.status(400).json({ message: "Invalid User Data" });
        }

    } catch (err) {
        console.log("Error in singnup controller: ", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const updateProfile = async (req, res) => {
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message: "Profile Pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findOneAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});

        res.status(200).json(updatedUser);

    }catch(error){
        console.log("Error in updateProfile controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

const checkAuth = (req, res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}


export {
    login,
    logout,
    signup,
    updateProfile,
    checkAuth
}