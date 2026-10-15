

const express = require ('express');
const bcrpyt = require ('bcryptjs');
const jwt= require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// user resigtion POst 
router.post('/register',async (req,res,next)=>{try{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({message:"plaese fill in  all details. "})
    }
    let user = await User.findOne({email});
    if(user) return res.status(400).json({message:'this email already registered.'})

        // password hashing
        // const salt = await bcrpyt.genSalt(10);
        // const hashPassword = await bcrpyt.hash(password,salt);

        user = new User({name,email,password});
        await user.save();
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h',});
        res.status(201).json({token,user:{id:user._id,name,email}})

}catch(err){
 next(err)
}})

// user login post
router.post("/login",async(req,res,next)=>{
    try{
        const{email,password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message:'Both email and password are required.'});
        }
            const user = await User.findOne({email});
            if(!user) return res.status(400).json({message:'worng email or password.'})
                // password verification
            const isMatch = await user.comparePassword(password);
            if(!isMatch) return res.status(400).json({message:'worng email and password'});
             const token = jwt.sign ({id: user._id},process.env.JWT_SECRET,{
                expiresIn:'1h',
             })
             res.json({token,user:{id:user._id,name:user.name,email}});
        }catch(err){
            next(err)
        }
})
module.exports = router
