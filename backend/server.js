
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authConnection = require("./config/authdb")

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
      `${name} must export an Express router. Check module.exports = router in ${path}`,
    );
  }

  return router;
};
const authRoutes = require("./routes/authRoutes")
app.use("/api/auth",authRoutes)

// Routes
app.use(
  "/api/dashboard",
  loadRouter("Dashboard routes", "./routes/dashboardRoutes"),
);

app.use("/api/leads", loadRouter("Lead routes", "./routes/leadRoutes"));

app.use("/api/auth", loadRouter("Auth routes", "./routes/authRoutes"));

app.use("/api/users", loadRouter("User routes", "./routes/userRoutes"));

app.use(
  "/api/follow-ups",
  loadRouter("Follow-up routes", "./routes/followUpRoutes"),
);

app.use(
  "/api/notifications",
  loadRouter("Notification routes", "./routes/notificationRoutes"),
);

app.use(
  "/api/audit-logs",
  loadRouter("Audit log routes", "./routes/auditLogRoutes"),
);

// Health check
app.get("/", (req, res) => {
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
      err.status && err.status < 500 ? err.message : "Internal Server Error",
  });
});

// Start server only after MongoDB connects
// const startServer = async () => {
//   try {
//     await connectDB();

//     // Start scheduler after database connection
//     try{

//       const { startNotificationScheduler } = require("./services/notificationService");
//       if (typeof startNotificationScheduler === "function") {
//         startNotificationScheduler();
//       }
//     }catch(error){
//       console.error("notification scheduler startup error;",error);

//     }

//     const server=app.listen(PORT, "127.0.0.1",() => {
//       console.log(`LeadSphere CRM API running at http://127.0.0.1:${PORT}`);
//       console.log(`health check:http://127.0.0.1:${PORT}/test`);

//     });
//     server.on("error",(error)=>{
//       console.error("HTTP server error:",error);

//     })
//   } catch (error) {
//     console.error("Server startup failed:", error.message);
//     process.exitCode=1;
//   }
// };
// / Start server only after both databases are connected
async function startServer() {
  try {
    // Connect to leadsphere database
    await connectDB();
    console.log(" leadsphere database ready");

    // Wait until crm_auth_db connection is ready
    await authConnection.asPromise();
    console.log("crm_auth_db database ready");

    // Start server after database connections succeed
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Server startup failed:", error.message);
    process.exit(1);
  }
}




startServer();
