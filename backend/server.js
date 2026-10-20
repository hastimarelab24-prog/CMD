// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const User = require('./models/User')
// const authMiddleware = require("./middleware/authMiddleware")
// const {validateRegistration,validateLogin} = require('./middleware/validationMiddleware')
// const connectDB = require('./config/db')
// const followup = require('./routes/followUpRoutes')
// const app = express();
 
//   const {
//   startNotificationScheduler,
// } = require("./services/notificationService");

// // MongoDB સફળતાપૂર્વક connect થયા પછી
// startNotificationScheduler();
// const notificationRoutes = require("./routes/notificationRoutes");

// const auditLogRoutes = require("./routes/auditLogRoutes");

// //  CRITICAL FIX: These body parsers MUST be declared before any route handles requests!
// app.use(cors());
// app.use(express.json()); 

// app.use(express.urlencoded({ extended: true }));
// app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// app.use('/api/leads',require('./routes/leadRoutes'));
// app.use('/api/auth',require('./routes/authRoutes'))
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/follow-ups',followup)
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/audit-logs", auditLogRoutes);
// //  Debug Testing Route
// app.get('/test', (req, res) => {
//   res.send('Backend Server is live and fully accessible!');
// });



// //  Registration API 
// app.post('/api/auth/register',validateRegistration, async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
    
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All parameters (name, email, password) are strictly required.' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'This email is already registered.' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'my_super_secret_key', { expiresIn: '1h' });
//     res.status(201).json({ token, user: { id: newUser._id, name, email } });
//   } catch (err) {
//     next(err);
//   }
// });


// // Login API 
// app.post('/api/auth/login',validateLogin, async (req, res, next) => {
//   try {
//     // Debug point to print exactly what your backend receives in the terminal shell window
//     console.log(" Incoming request payload: ", req.body);

//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Both Email and Password fields are required.' });
//     }

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials. User not found.' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'my_super_secret_key', { expiresIn: '1h' });
//     res.json({ token, user: { id: user._id, name: user.name, email } });
//   } catch (err) {
//     next(err);
//   }
// });





// app.get("/api/dashboard/profile",authMiddleware,async(req,res,next)=>{
//   try{
//     const user = await User.findById(req.user.id).select("-password");
//     if(!user) return res.status(404).json({message:"user not found"})
//       res.json(user);
//   }catch(err){
//     next(err)
//   }
// })
// app.get("/api/dashboard/stats",authMiddleware,async(req,res,next)=>{
//   try{
//     res.json({totalViews:Math.floor(Math.random()*900)+100,
//       activeProjects:4, accountStatus:"verified production node",
//     })
//   }catch(err){
//     next(err)
//   }
// })

// // Centralized Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Internal Server Error', error: err.message });
// });

// const PORT = process.env.PORT || 5000;
// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Database connection failed:", error.message);
//     process.exit(1);
//   }
// };

// startServer();




// // // 🗄️ Database Connection 
// // const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leadsphere';
// // mongoose.connect(mongoURI)
// //   .then(() => console.log('✅ MongoDB connected successfully...'))
// //   .catch(err => console.error('❌ Database connection error:', err));




const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Safely load Express routers and report incorrect exports
const loadRouter = (name, path) => {
  const router = require(path);

  if (typeof router !== "function") {
    throw new TypeError(
      `${name} must export an Express router. Check module.exports = router in ${path}`
    );
  }

  return router;
};

// Routes
app.use("/api/dashboard", loadRouter("Dashboard routes", "./routes/dashboardRoutes"));

app.use(
  "/api/leads",
  loadRouter("Lead routes", "./routes/leadRoutes")
);

app.use(
  "/api/auth",
  loadRouter("Auth routes", "./routes/authRoutes")
);

app.use(
  "/api/users",
  loadRouter("User routes", "./routes/userRoutes")
);

app.use(
  "/api/follow-ups",
  loadRouter("Follow-up routes", "./routes/followUpRoutes")
);

app.use(
  "/api/notifications",
  loadRouter("Notification routes", "./routes/notificationRoutes")
);

app.use(
  "/api/audit-logs",
  loadRouter("Audit log routes", "./routes/auditLogRoutes")
);

// Health check
app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LeadSphere CRM API is running.",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal Server Error",
  });
});

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    // Start scheduler after database connection
    const { startNotificationScheduler } = require("./services/notificationService");

    if (typeof startNotificationScheduler === "function") {
      startNotificationScheduler();
    }

    app.listen(PORT, () => {
      console.log(`LeadSphere CRM API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
