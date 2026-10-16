// const express = require ('express');
// const bcrpyt = require ('bcryptjs');
// const jwt= require('jsonwebtoken');
// const User = require('../models/User');
// const router = express.Router();

// // user resigtion POst
// router.post('/register',async (req,res,next)=>{try{
//     const {name,email,password} = req.body;
//     if(!name || !email || !password){
//         return res.status(400).json({message:"plaese fill in  all details. "})
//     }
//     let user = await User.findOne({email});
//     if(user) return res.status(400).json({message:'this email already registered.'})

//         // password hashing
//         // const salt = await bcrpyt.genSalt(10);
//         // const hashPassword = await bcrpyt.hash(password,salt);

//         user = new User({name,email,password});
//         await user.save();
//         const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h',});
//         res.status(201).json({token,user:{id:user._id,name,email}})

// }catch(err){
//  next(err)
// }})

// // user login post
// router.post("/login",async(req,res,next)=>{
//     try{
//         const{email,password} = req.body;
//         if(!email || !password) {
//             return res.status(400).json({message:'Both email and password are required.'});
//         }
//             const user = await User.findOne({email});
//             if(!user) return res.status(400).json({message:'worng email or password.'})
//                 // password verification
//             const isMatch = await user.comparePassword(password);
//             if(!isMatch) return res.status(400).json({message:'worng email and password'});
//              const token = jwt.sign ({id: user._id},process.env.JWT_SECRET,{
//                 expiresIn:'1h',
//              })
//              res.json({token,user:{id:user._id,name:user.name,email}});
//         }catch(err){
//             next(err)
//         }
// })
// module.exports = router

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    // { expiresIn: "8h" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    // Public registration must not allow users to assign themselves
    // an administrator role.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "employee",
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed. Check backend terminal.",
    });
  }
});

module.exports = router;
