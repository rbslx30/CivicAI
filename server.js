const express = require('express');
const dotenv = require('dotenv');

// Load env variables at the very beginning
dotenv.config({ path: '../.env' });

const cors = require('cors');
const mongoose = require('mongoose');

// Load env (Looking at the root directory where package.json sits)

// Check required env
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in .env file");
    process.exit(1);
}

// Initialize app
const app = express();
app.disable('x-powered-by');

// Security Middleware
// These middlewares are already in the context server.js, keeping them.
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api/', limiter);
app.use((req, res, next) => {
    req.tenantId = req.headers['x-tenant-id'] || 'IN-MP-BHO';
    req.userRole = 'Admin'; 
    next();
});

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes relative to backend/ directory
// Ensure authRoutes is correctly linked
const authRouter = require('./routes/authRoutes'); // Load the router module
if (!authRouter) {
    console.error("❌ authRoutes module failed to load or returned null/undefined. Check path and export.");
}
app.use('/api/auth', authRouter); // Mount the loaded router
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Import new authentication and authorization middlewares
const verifyToken = require('./middleware/authMiddleware');
const authorizeRoles = require('./middleware/roleMiddleware');
const enforceDepartmentAccess = require('./middleware/enforceDepartmentAccess'); // New middleware

// Production Health Check
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'; // 1 = connected
    res.status(200).json({
        status: 'UP',
        database: dbStatus,
        environment: process.env.NODE_ENV || 'production', 
        timestamp: new Date() 
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "API Endpoint Not Found" });
});

app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Dashboard routes (protected by auth and role/department access)
app.use('/api/dashboard', verifyToken, authorizeRoles(['department_admin', 'super_admin']), require('./routes/dashboardRoutes'));

const startServer = async () => {
    try {
        console.log("⏳ Initializing MongoDB Connection...");
        
        await mongoose.connect(process.env.MONGO_URI); // Mongoose 6+ handles options internally
        /* Removed deprecated options:
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });
        console.log(`✔ MongoDB Connected to Host: ${mongoose.connection.host}`);
        console.log(`✔ Active Database: ${mongoose.connection.name}`);

        mongoose.connection.on('error', err => console.error('❌ MongoDB runtime error:', err));
        mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected.'));

        await provisionAdmin();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✔ Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

const provisionAdmin = async () => {
    try {
        const User = require('./models/User'); // Ensure User model is imported here
        const bcrypt = require('bcryptjs');
        const adminEmail = 'admin@civicai.ai';
        const superAdminEmail = 'superadmin@civicai.ai';
        const waterDeptAdminEmail = 'wateradmin@civicai.ai';
        
        // Provision Super Admin
        const superAdminExists = await User.findOne({ email: superAdminEmail });
        if (!superAdminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Super Admin', email: superAdminEmail, password: hashedPassword, role: 'super_admin'
            });
            console.log('✅ System: Super Admin provisioned.');
            await User.create({
                name: 'Water Dept Admin', email: waterDeptAdminEmail, password: hashedPassword, role: 'department_admin', department: 'Water Supply Department'
            });
            console.log('✅ System: Default Admin provisioned.');
        }
    } catch (err) {
        console.error('⚠️ System: Admin provisioning skipped:', err.message);
    }
};

startServer();

process.on('uncaughtException', (err) => console.error("❌ Uncaught Exception:", err.message));
process.on('unhandledRejection', (reason) => console.error("❌ Unhandled Rejection:", reason));