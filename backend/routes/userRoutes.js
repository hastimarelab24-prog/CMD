// const express = require("express")
// const bcrypt = require("bcryptjs")
// const User = require("../models/User");
// const authMiddleware = require("../middleware/authMiddleware");
// const allowRole = require("../middleware/roleMiddleware")
// const logAction = require("../until/auditLogger")
// const router = express.Router()
// router.use(authMiddleware)
// router.use(allowRoles("administrator"))

// router.get("/",async(req,res)=>{
//     try{
//         const users = await User.find().select("-password").sort({creatAt:-1});
//         res.json(users);
//     }catch(error){
//         res.status(500).json({message:"failed to fetch users"})
//     }
// })

// // create a user
// router.post("/",async(req,res)=>{
//     try{
//         const{name,emali,psaaword,role} = req.body;
//         if(!name?.trim() || !email?.trim() || !password){
//             return res.status(400).json({message:"name email and password are required",})
//         }
//         if(password.length  < 8){
//             return res.status(400).json({message:"password must contain at least 8 characters",})
//         }
//         const validRoles = ["administrator","manger","employee"];
//         if(!validRoles.includes(role)){
//             return res.status(400).json({message:"invalid role."})
//         }
//         const normalizedEmail = email.trim().toLowerCase();
//         const existingUser = await User.findOne({email:normalizedEmail,})
//         if(existingUser){return res.status(409).json({message:"email already exists"})}
//         const hashedPassword = await bcrypt.hash(password,12);
//         const user = await User.create({name:name.trim(),email:normalizedEmail,password:hashedPassword,role,})
//         await logAction(req.user.id,"USER_CREATED","User",user._id.toString(),{role:user.role})
//         res.status(201).json({messange:"user created successfully",user:{is:user._id,name:user.name,email:user.email,role:user.role,isActive:user.isActive,}})
//     }catch(error){
//         res.status(500).json({message:"failed to create user"})
//     }
// })
// // update user role
// router.patch("/:id/role",async(req,res)=>{
//     try{
//         const {role} = req.body
//    const validRoles = ["administrator","manger","employee"];
//        if(!validRoles.includes(role)){
//             return res.status(400).json({message:"invalid role."})
//         }
//         if(req.user.id === req.params.id){
//             return res.status(400).json({message:"you cannot your own role.",})
//         }
//         const user = await User.findById(req.params.id);
//         if(!user){return res.status(404).json({mesage:"user not found"})}
//         const previousRole = user.role;
//         user.role=role;
//         await logAction(req.user.id,"USER_ROLE_UPDATED","User",user._id.toString(),{previousRole,newRole:role})
//         res.json({message:"user role updated successfully",
//             user:{
//                 id:user._id,name:user.name,email:user.email,role:user.role,
//             }
//         })
// }catch(error){
//     res.status(500).json({message:"failed to update role"})
// }
// })
// module.exports = router;

const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const logAction = require("../until/auditLogger");

const router = express.Router();

const validRoles = ["administrator", "manager", "employee"];

// All routes require authentication and administrator access.
router.use(authMiddleware);
router.use(allowRole("administrator"));

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error);

    return res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
});

// CREATE USER
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (typeof role !== "string" || !validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    // User.js pre-save hook should hash the password.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    // Log the action separately so an audit failure is identifiable.
    try {
      await logAction(
        req.user.id,
        "USER_CREATED",
        "User",
        user._id.toString(),
        { role: user.role }
      );
    } catch (auditError) {
      console.error("Audit logger error during user creation:", auditError);

      // The user has already been created.
      // Do not pretend that creation failed and invite duplicate submissions.
    }

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: error.message || "Failed to create user.",
    });
  }
});

// UPDATE USER ROLE
router.patch("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const previousRole = user.role;

    user.role = role;
    await user.save();

    try {
      await logAction(
        req.user.id,
        "USER_ROLE_UPDATED",
        "User",
        user._id.toString(),
        {
          previousRole,
          newRole: role,
        }
      );
    } catch (auditError) {
      console.error("Audit logger error during role update:", auditError);
    }

    return res.status(200).json({
      message: "User role updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update user role.",
    });
  }
});

module.exports = router;
