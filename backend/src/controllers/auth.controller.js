import User from "../models/user.model.js";
import { generatetoken } from "../lib/utils.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";



export const signup = async (req,res)=>{
   // res.send("signup route");

   const {fullName, email, password} = req.body;
   try {

    if(!fullName || !email || !password){
        return res.status(400).json({message : "All fields are required"});
    }

    if(password.length < 6){
        return res.status(400).json({message : "Password must be stleast 6 charachter"});
    }

    const user = await User.findOne({email});

    if((user)) return res.status(400).json({message : "Email already exists"});
    
    //hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password, salt);
    
    const newUser = new User({
        fullName : fullName,
        email: email,
        password : hashedpass,
    })

    if(newUser){
        //generate JWT token
        generatetoken(newUser._id, res);      //res is passed so that cookie generated can be directly attatched to the response.
        await newUser.save();

        res.status(201).json({
            _id : newUser._id,
            fullName : newUser.fullName,
            email: newUser.email,
            profilePic : newUser.profilePic,
        });
    }else{
        res.status(400).json({message : "Invalid User data"});
    }


   } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({message : "Internal server error"});
   }

};

export const login = async (req,res)=>{
    //  res.send("login route");
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message : "Invalid"});
        }
        
        const isPasswordcorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordcorrect){
            return res.status(400).json({message : "Invalid credentials"});
        }

        generatetoken(user._id, res)

        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic
        })

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message : "Internal server error"});
    }

};

export const logout = (req,res)=>{
    //res.send("logout route");
    try {
        res.cookie("jwt", "", {maxAge : 0})
        res.status(200).json({message : "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message : "Internal server error"});
    }
};

export const updateprofile = async(req, res)=>{

    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message : "Profile pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true})

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("error in update profile : ", error);
        res.status(500).json({message : "Intenal Server error"});
    }
     
};

export const checkAuth = async(req, res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message : "Internal Server error"});
    }
};