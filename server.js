const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

// Load env (Looking at the root directory where package.json sits)
dotenv.config({ path: '../.env' });

// Check required env
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in .env file");
    process.exit(1);
}

// Initialize app
const app = express();
app.disable('x-powered-by'); 

// Security Middleware
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
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const { verifyToken, isAdmin } = require('./middleware/authMiddleware');
app.use('/api/dashboard', verifyToken, isAdmin, require('./routes/dashboardRoutes'));

// Production Health Check
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
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

const startServer = async () => {
    try {
        console.log("⏳ Initializing MongoDB Connection...");
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000, 
            maxPoolSize: 10,
            family: 4 
        });
        console.log("✔ MongoDB Connected");

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
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const adminEmail = 'admin@civicai.ai';
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Super Admin', email: adminEmail, password: hashedPassword, role: 'admin'
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