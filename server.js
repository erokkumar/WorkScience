const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = "mongodb+srv://Attendance:EPnSU3gmQZr63IzN@workscience.l4q30.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoURI).then(() => console.log("✅ Connected to MongoDB")).catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
});

// JWT Secret Key
const JWT_SECRET = "yourSecretKey";

// ✅ User Schema (Employee Authentication)
const userSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// ✅ Attendance Schema
const attendanceSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    date: { type: String, required: true }
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// 📌 Middleware to Protect Routes
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = decoded;
        next();
    });
};

// 📌 Register Employee API
app.post("/register", async (req, res) => {
    const { employeeName, userId, password } = req.body;

    try {
        const existingUser = await User.findOne({ userId });
        if (existingUser) return res.status(400).json({ message: "User ID already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ employeeName, userId, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Employee Login API
app.post("/login", async (req, res) => {
    const { userId, password } = req.body;

    try {
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: "Invalid User ID." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password." });

        const token = jwt.sign({ userId: user.userId, employeeName: user.employeeName }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Attendance APIs
app.post("/attendance", authenticate, async (req, res) => {
    const { employeeName } = req.user;

    const date = new Date().toISOString().split("T")[0];
    const existingAttendance = await Attendance.findOne({ employeeName, date });

    if (existingAttendance) {
        return res.status(400).json({ message: "You have already Check In in today." });
    }

    const newAttendance = new Attendance({ employeeName, date });
    await newAttendance.save();
    res.status(201).json({ message: "Check Out in successfully." });
});

// 📌 Logout (Clock Out)
app.post("/logout", authenticate, async (req, res) => {
    const { employeeName } = req.user;
    const date = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ employeeName, date, logoutTime: { $exists: false } });

    if (!attendance) return res.status(400).json({ message: "You haven't Check In today." });

    attendance.logoutTime = new Date();
    await attendance.save();

    res.status(200).json({ message: "Check Out successfully." });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
